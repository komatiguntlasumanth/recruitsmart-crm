# Stage 1: Build the frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
# Optimize npm install by copying only package files first
COPY frontend/package*.json ./
RUN npm install
# Copy the rest of the frontend source
COPY frontend/ ./
# Ensure binaries are executable (fixes Windows upload issues)
RUN chmod -R +x node_modules/.bin
# Build frontend (Vite)
# We set VITE_API_URL to empty so it uses same-origin in production
RUN VITE_API_URL="" npm run build

# Stage 2: Build the backend with the frontend assets
FROM maven:3.8.5-openjdk-17 AS backend-build
WORKDIR /app
# Prepare the directory for static assets
RUN mkdir -p backend/src/main/resources/static
# Copy the built frontend to spring boot's static resources
COPY --from=frontend-build /app/frontend/dist/ backend/src/main/resources/static/
# Copy the backend source
COPY backend/ ./backend
WORKDIR /app/backend
# Build the jar
RUN mvn clean package -DskipTests

# Stage 3: Run the application
FROM openjdk:17-jdk-slim
WORKDIR /app
# Copy the jar from the build stage
COPY --from=backend-build /app/backend/target/*.jar app.jar

# Hugging Face Spaces runs on 7860
EXPOSE 7860

# Set spring boot to run on 7860 and use the prod profile
ENV SERVER_PORT=7860
ENV SPRING_PROFILES_ACTIVE=prod
# Increase memory limit as HF Spaces provides 16GB
ENV JAVA_OPTS="-Xmx8g -Xms4g"

# Start the application
ENTRYPOINT ["java", "-Xmx8g", "-jar", "app.jar"]
