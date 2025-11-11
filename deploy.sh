#!/bin/bash
set -e

AWS_REGION="us-east-1"
BACKEND_REPO="guestbook-backend"
FRONTEND_REPO="guestbook-frontend"

echo "Logowanie do ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin "$(aws sts get-caller-identity --query 'Account' --output text).dkr.ecr.$AWS_REGION.amazonaws.com"

ACCOUNT_ID=$(aws sts get-caller-identity --query 'Account' --output text)
BACKEND_IMAGE="$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$BACKEND_REPO"
FRONTEND_IMAGE="$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$FRONTEND_REPO"

echo "Budowanie obrazu backendu..."
docker build -t $BACKEND_IMAGE ./backend
echo "Push backend..."
docker push $BACKEND_IMAGE

echo "Budowanie obrazu frontendu..."
# Pobierz dane z terraform (jeśli już istnieją)
cd infra
terraform init -input=false > /dev/null
terraform apply -auto-approve -target=aws_cognito_user_pool_client.guestbook_client -input=false > /dev/null
CLIENT_ID=$(terraform output -raw cognito_user_pool_client_id)
REGION=$(terraform output -raw cognito_region)
cd ..

docker build \
  --build-arg VITE_COGNITO_CLIENT_ID=$CLIENT_ID \
  --build-arg VITE_AWS_REGION=$REGION \
  -t $FRONTEND_IMAGE ./frontend

echo "Push frontend..."
docker push $FRONTEND_IMAGE

echo "Wszystko gotowe. Teraz uruchom: terraform apply"
