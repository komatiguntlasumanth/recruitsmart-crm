# Stage 1: Build the frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
# Cache dependencies
COPY frontend/package*.json ./
RUN npm install
# Build source
COPY frontend/ ./
RUN npm run build

# Stage 2: Build the backend
FROM maven:3.8.5-openjdk-17-slim AS backend-build
WORKDIR /app/backend
# Cache maven dependencies
COPY backend/pom.xml ./
RUN mvn dependency:go-offline -B

# Copy source and built frontend
COPY backend/src ./src
RUN mkdir -p src/main/resources/static
COPY --from=frontend-build /app/frontend/dist/ src/main/resources/static/

# Build the jar
RUN mvn clean package -DskipTests -B

# Stage 3: Run the application
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=backend-build /app/backend/target/*.jar app.jar

# Hugging Face Spaces expects 7860
EXPOSE 7860

ENV SPRING_PROFILES_ACTIVE=prod
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+TieredCompilation -XX:TieredStopAtLevel=1 -Xss256k"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
