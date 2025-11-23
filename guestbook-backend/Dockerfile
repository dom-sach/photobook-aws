# --- build stage ---
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -q -e -DskipTests package spring-boot:repackage

# --- runtime stage ---
FROM eclipse-temurin:21-jre
WORKDIR /app
RUN useradd -ms /bin/bash appuser \
 && mkdir -p /app/uploads \
 && chown -R appuser:appuser /app
COPY --from=build /app/target/*.jar /app/app.jar
USER appuser

EXPOSE 8080
ENV JAVA_OPTS=""
ENV PORT=8080
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar /app/app.jar"]

