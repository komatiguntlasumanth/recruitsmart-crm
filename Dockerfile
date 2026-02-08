# Stage 1: Build the frontend
FROM node:18-slim AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build the backend
FROM maven:3.9.6-eclipse-temurin-17 AS backend-build
WORKDIR /app/backend
# Set memory limits for Maven build
ENV MAVEN_OPTS="-Xmx1536m -XX:MaxMetaspaceSize=256m"
COPY backend/pom.xml ./
COPY backend/src ./src
# Ensure the static directory is created and then copy frontend build
RUN mkdir -p src/main/resources/static && \
    cp -rv /app/frontend/dist/* src/main/resources/static/

# Build the jar
RUN mvn clean package -DskipTests -B

# Stage 3: Run the application
FROM openjdk:17-slim
WORKDIR /app
COPY --from=backend-build /app/backend/target/*.jar app.jar

# Hugging Face Spaces expects 7860
EXPOSE 7860

ENV SPRING_PROFILES_ACTIVE=prod
# Robust Memory Settings for HF (512MB-1GB environments)
ENV JAVA_OPTS="-Xmx256m -Xms256m -XX:+UseSerialGC -XX:MaxMetaspaceSize=128m -Djava.security.egd=file:/dev/./urandom"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
