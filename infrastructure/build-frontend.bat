@echo off

echo Wrzucam Cognito user pools na frontend...
echo CLIENT_ID=%VITE_COGNITO_CLIENT_ID%
echo USER_POOL_ID=%VITE_COGNITO_USER_POOL_ID%
echo VITE_BACKEND_URL=%VITE_BACKEND_URL%

cd ..\guestbook-frontend
echo Budowanie obrazu frontendu...
docker build ^
  --build-arg VITE_COGNITO_CLIENT_ID=%VITE_COGNITO_CLIENT_ID% ^
  --build-arg VITE_COGNITO_USER_POOL_ID=%VITE_COGNITO_USER_POOL_ID% ^
  --build-arg VITE_FRONTEND_URL=%VITE_FRONTEND_URL% ^
  --build-arg VITE_AWS_REGION=%AWS_REGION% ^
  --build-arg VITE_BACKEND_URL=%VITE_BACKEND_URL% ^
  -t guestbook-frontend .


echo Logowanie do ECR...
FOR /F "tokens=*" %%i IN ('aws ecr get-login-password --region %AWS_REGION%') DO docker login --username AWS --password %%i %ECR_URL%

echo Tagowanie obrazu...
docker tag guestbook-frontend:latest %ECR_URL%:latest

echo Push do ECR...
docker push %ECR_URL%:latest

echo Frontend image pushed to %ECR_URL%
