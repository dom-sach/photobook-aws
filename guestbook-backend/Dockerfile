# --- build stage ---
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q -e -DskipTests dependency:go-offline
COPY src ./src
RUN mvn -q -e -DskipTests package spring-boot:repackage

# --- runtime stage ---
FROM eclipse-temurin:21-jre

# 1) pracujemy jako root, przygotowujemy katalogi i uprawnienia
WORKDIR /app
RUN useradd -ms /bin/bash appuser \
 && mkdir -p /app/uploads \
 && chown -R appuser:appuser /app

# 2) kopiujemy JAR
COPY --from=build /app/target/*.jar /app/app.jar

# 3) dopiero teraz schodzimy na nie-root
USER appuser

EXPOSE 8080
ENV JAVA_OPTS=""
ENV PORT=8080

ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar /app/app.jar"]

