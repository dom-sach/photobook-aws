# infra/main.tf

provider "aws" {
  region = var.aws_region
}

# ==== Cognito User Pool & Client ====
resource "aws_cognito_user_pool" "guestbook_users" {
  name = "guestbook-user-pool"
  auto_verified_attributes = ["email"]
  username_attributes = ["email"]
  password_policy {
    minimum_length = 6
    require_lowercase = false
    require_uppercase = false
    require_numbers = false
    require_symbols = false
  }
}

resource "aws_cognito_user_pool_client" "guestbook_client" {
  name = "guestbook-client"
  user_pool_id = aws_cognito_user_pool.guestbook_users.id
  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_ADMIN_USER_PASSWORD_AUTH"
  ]
  generate_secret = false
}


# ===== ECR repository for backend image =====
resource "aws_ecr_repository" "backend_repo" {
  name = "guestbook-backend"
}

# ===== ECR repository for frontend image =====
resource "aws_ecr_repository" "frontend_repo" {
  name = "guestbook-frontend"
}


# ===== IAM role (reused from Learner Lab) =====
# No creation — use provided LabRole instead

# ===== Log group for ECS logs =====
resource "aws_cloudwatch_log_group" "guestbook_logs" {
  name              = "/ecs/guestbook"
  retention_in_days = 7
}

# ===== S3 bucket for media files =====
resource "aws_s3_bucket" "media_bucket" {
  bucket = var.media_bucket_name
  force_destroy = true
}

resource "aws_s3_bucket_public_access_block" "media_bucket_block" {
  bucket = aws_s3_bucket.media_bucket.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# ===== VPC and networking =====
data "aws_availability_zones" "available" {}

resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true
}

resource "aws_subnet" "public" {
  count = 2
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(aws_vpc.main.cidr_block, 8, count.index)
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
}

resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.main.id
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
}

resource "aws_route" "default_route" {
  route_table_id         = aws_route_table.public.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.gw.id
}

resource "aws_route_table_association" "a" {
  count          = 2
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# ===== ECS Cluster =====
resource "aws_ecs_cluster" "guestbook_cluster" {
  name = "guestbook-cluster"
}

# ===== Security Group for ALB and ECS =====
resource "aws_security_group" "alb_sg" {
  name        = "guestbook-alb-sg"
  description = "Allow HTTP"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "ecs_service_sg" {
  name   = "guestbook-ecs-sg"
  vpc_id = aws_vpc.main.id

  ingress {
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group_rule" "allow_frontend_from_alb" {
  type                     = "ingress"
  from_port                = 80
  to_port                  = 80
  protocol                 = "tcp"
  security_group_id        = aws_security_group.ecs_service_sg.id
  source_security_group_id = aws_security_group.alb_sg.id
}



# ===== ALB =====
resource "aws_lb" "guestbook_alb" {
  name               = "guestbook-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = aws_subnet.public[*].id
}

resource "aws_lb_target_group" "guestbook_tg" {
  name        = "guestbook-tg"
  port        = 8080
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_vpc.main.id
  health_check {
    path = "/api/messages"
    matcher = "200"
  }
}

resource "aws_lb_target_group" "frontend_tg" {
  name        = "frontend-tg"
  port        = 80
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_vpc.main.id

  health_check {
    path     = "/"
    matcher  = "200-399"
  }
}

resource "aws_lb_listener" "frontend_http" {
  load_balancer_arn = aws_lb.guestbook_alb.arn
  port              = 80
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend_tg.arn
  }
}

resource "aws_lb_listener_rule" "api_backend_rule" {
  listener_arn = aws_lb_listener.frontend_http.arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.guestbook_tg.arn
  }

  condition {
    path_pattern {
      values = ["/api/*"]
    }
  }
}



# ===== Task Definition - backend =====
resource "aws_ecs_task_definition" "backend_task" {
  family                   = "guestbook-backend-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = var.task_execution_role_arn

  container_definitions = jsonencode([
    {
      name = "guestbook-backend",
      image = aws_ecr_repository.backend_repo.repository_url,
      essential = true,
      portMappings = [{ containerPort = 8080, protocol = "tcp" }],
      logConfiguration = {
        logDriver = "awslogs",
        options = {
          awslogs-group = aws_cloudwatch_log_group.guestbook_logs.name,
          awslogs-region = var.aws_region,
          awslogs-stream-prefix = "ecs"
        }
      },
      environment = [
        {
          name = "COGNITO_ISSUER_URI",
          value = "https://cognito-idp.${var.aws_region}.amazonaws.com/${aws_cognito_user_pool.guestbook_users.id}"
        },
        {
          name = "MEDIA_BUCKET",
          value = aws_s3_bucket.media_bucket.bucket
        }
      ]
    }
  ])
}

# ===== Task Definition - frontend =====
resource "aws_ecs_task_definition" "frontend_task" {
  family                   = "guestbook-frontend-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = var.task_execution_role_arn

  container_definitions = jsonencode([
    {
      name      = "guestbook-frontend",
      image     = "${aws_ecr_repository.frontend_repo.repository_url}:latest",
      essential = true,
      portMappings = [{
        containerPort = 80,
        protocol      = "tcp"
        hostPort      = 80
      }],
      environment = [
        {
          name  = "BACKEND_URL"
          value = "http://${aws_lb.guestbook_alb.dns_name}:8080"
        }
      ],
      logConfiguration = {
        logDriver = "awslogs",
        options = {
          awslogs-group         = aws_cloudwatch_log_group.guestbook_logs.name,
          awslogs-region        = var.aws_region,
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "frontend_service" {
  name            = "guestbook-frontend-service"
  cluster         = aws_ecs_cluster.guestbook_cluster.id
  launch_type     = "FARGATE"
  task_definition = aws_ecs_task_definition.frontend_task.arn
  desired_count   = 1

  network_configuration {
    subnets         = aws_subnet.public[*].id
    security_groups = [aws_security_group.ecs_service_sg.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.frontend_tg.arn
    container_name   = "guestbook-frontend"
    container_port   = 80
  }

  depends_on = [aws_lb_listener.frontend_http]
}


# ===== ECS Service =====
resource "aws_ecs_service" "backend_service" {
  name            = "guestbook-backend-service"
  cluster         = aws_ecs_cluster.guestbook_cluster.id
  launch_type     = "FARGATE"
  task_definition = aws_ecs_task_definition.backend_task.arn
  desired_count   = 1
  network_configuration {
    subnets         = aws_subnet.public[*].id
    security_groups = [aws_security_group.ecs_service_sg.id]
    assign_public_ip = true
  }
  load_balancer {
    target_group_arn = aws_lb_target_group.guestbook_tg.arn
    container_name   = "guestbook-backend"
    container_port   = 8080
  }
  depends_on = [aws_lb_listener.frontend_http]
}

# ==== OUTPUTS ====
output "alb_dns_name" {
  value = aws_lb.guestbook_alb.dns_name
}

output "media_bucket_name" {
  value = aws_s3_bucket.media_bucket.id
}

output "log_group_name" {
  value = aws_cloudwatch_log_group.guestbook_logs.name
}

output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.guestbook_users.id
}

output "cognito_user_pool_client_id" {
  value = aws_cognito_user_pool_client.guestbook_client.id
}

output "cognito_region" {
  value = var.aws_region
}

# dla backendu
output "cognito_issuer_uri" {
  value = "https://cognito-idp.${var.aws_region}.amazonaws.com/${aws_cognito_user_pool.guestbook_users.id}"
}

output "frontend_url" {
  value = "http://${aws_lb.guestbook_alb.dns_name}/"
}

output "backend_url" {
  value       = "http://${aws_lb.guestbook_alb.dns_name}/api"
}





# lokalna zmienna dla frontendu
locals {
  vite_env = {
    VITE_COGNITO_CLIENT_ID = aws_cognito_user_pool_client.guestbook_client.id
    VITE_AWS_REGION        = var.aws_region
  }
}


# ==== VARIABLES ====
variable "aws_region" {
  type        = string
  description = "AWS region to deploy to"
  default     = "us-east-1"
}

variable "media_bucket_name" {
  type        = string
  description = "Name for the S3 bucket to store media files"
}

variable "task_execution_role_arn" {
  type        = string
  description = "ARN of IAM role with ecsTaskExecution permissions"
}



resource "null_resource" "build_backend_image" {
  provisioner "local-exec" {
    command = "build-backend.bat"
    environment = {
      AWS_REGION = var.aws_region
      ECR_URL    = aws_ecr_repository.backend_repo.repository_url
    }
  }

  triggers = {
    always_run = timestamp()
  }
}

resource "null_resource" "build_frontend_image" {
  provisioner "local-exec" {
    command = "build-frontend.bat"
    environment = {
      AWS_REGION             = var.aws_region
      ECR_URL                = aws_ecr_repository.frontend_repo.repository_url
      VITE_COGNITO_USER_POOL_ID = aws_cognito_user_pool.guestbook_users.id
      VITE_COGNITO_CLIENT_ID = aws_cognito_user_pool_client.guestbook_client.id
      VITE_FRONTEND_URL      = "http://${aws_lb.guestbook_alb.dns_name}/api"
    }
    interpreter = ["cmd", "/C"]
  }

  triggers = {
    always_run = timestamp()
  }
}
