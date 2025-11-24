[PWr] Simple web app project to be hosted on AWS services

# Guestbook App 
Guestbook App is a cloud-native web application deployed fully on AWS using modern serverless components.
It allows users to:
- register and log in (AWS Cognito),
- upload images with captions (AWS S3),
- view all uploaded images,
- add comments,
- edit their profile,
- and interact through a simple, clean SPA frontend.

The entire infrastructure is generated automatically using Terraform, while the application itself is packaged as two containerized modules (frontend + backend) and deployed on AWS ECS with Fargate.
This project was developed as part of an academic assignment on cloud infrastructure automation.

# Architecture
The application is split into two independently deployed modules:

## Backend – Spring Boot
- REST API with authentication and authorization via JWT (Cognito)
- Handles:
  - image upload/download,
  - profile management,
  - comments,
  - metadata storage in AWS RDS (PostgreSQL)
- Packaged as a Docker image and served in an ECS service (Fargate).

## Frontend – React + Nginx
- SPA written in React (Vite)
- Auth flow implemented using amazon-cognito-identity-js
- Communicates with backend through a shared Application Load Balancer
- Built into a static bundle and served by Nginx

## AWS Infrastructure (managed by Terraform)
### Compute
- ECS Cluster (Fargate launch type)
- 2 ECS Services:
  - guestbook-backend-service
  - guestbook-frontend-service

### Storage
- S3 Bucket for media files (public read for objects)
- RDS PostgreSQL database

### Authentication
- Cognito User Pool
- Cognito App Client
- Lambda trigger for auto-confirming new users

### Networking
- VPC (10.0.0.0/16)
- 2 public subnets
- Internet Gateway + route table
- ALB with:
  - default: frontend target group
  - /api/* → backend target group

### Logging & Monitoring
- CloudWatch Log Group for ECS tasks

### Image Repositories
- ECR repository for backend
- ECR repository for frontend

# How to run?
Configure AWS CLI with your AWS credentials:

```aws configure```

Run Terraform with:

```terraform apply --auto-approve```

That's it.
