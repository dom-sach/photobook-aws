# --- build stage ---
FROM node:20 AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY .. .

# podanie adresu API przy buildzie (domyślnie backend z compose)
ARG VITE_API_URL=http://backend:8080
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# --- runtime stage (nginx) ---
FROM nginx:alpine

# prosta konfiguracja dla SPA (fallback na /index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
