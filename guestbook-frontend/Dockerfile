# --- build stage ---
FROM node:20 AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Przekazujemy build-arg z Terraform
ARG VITE_API_URL=http://backend:8080
ARG VITE_AWS_REGION
ARG VITE_FRONTEND_URL
ARG VITE_COGNITO_CLIENT_ID
ARG VITE_COGNITO_USER_POOL_ID

# Definiujemy je jako ENV żeby Vite je widział (npm run build)
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_AWS_REGION=$VITE_AWS_REGION
ENV VITE_FRONTEND_URL=$VITE_FRONTEND_URL
ENV VITE_COGNITO_CLIENT_ID=$VITE_COGNITO_CLIENT_ID
ENV VITE_COGNITO_USER_POOL_ID=$VITE_COGNITO_USER_POOL_ID

COPY .. .
RUN npm run build

# --- runtime stage ---
FROM nginx:alpine

# kopiujemy szablon konfiguracyjny
COPY nginx.template.conf /etc/nginx/templates/nginx.template.conf

# kopiujemy frontend
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
