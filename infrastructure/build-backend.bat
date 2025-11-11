@echo off
echo Budowanie obrazu backendu...
docker build -t guestbook-backend ..\guestbook-backend

echo Logowanie do ECR...
FOR /F "tokens=*" %%i IN ('aws ecr get-login-password --region %AWS_REGION%') DO docker login --username AWS --password %%i %ECR_URL%

echo Tagowanie obrazu...
docker tag guestbook-backend:latest %ECR_URL%:latest

echo Push do ECR...
docker push %ECR_URL%:latest

echo Backend image pushed to %ECR_URL%
