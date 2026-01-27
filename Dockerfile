# Stage 1: Build the frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
# Copy only necessary frontend files (avoiding node_modules if it exists)
COPY frontend/src ./src
COPY frontend/public ./public
COPY frontend/index.html ./
COPY frontend/vite.config.js ./
# Build frontend
RUN VITE_API_URL="" npm run build

# Stage 2: Build the backend with the frontend assets
FROM maven:3.8.5-openjdk-17 AS backend-build
WORKDIR /app
# Prepare the directory for static assets
RUN mkdir -p backend/src/main/resources/static
# Copy the built frontend to spring boot's static resources
COPY --from=frontend-build /app/frontend/dist/ backend/src/main/resources/static/
# Copy only necessary backend files
COPY backend/pom.xml ./backend/
COPY backend/src ./backend/src
WORKDIR /app/backend
# Build the jar
RUN mvn clean package -DskipTests

# Stage 3: Run the application
FROM openjdk:17-jdk-slim
WORKDIR /app
# Copy the jar from the build stage
COPY --from=backend-build /app/backend/target/*.jar app.jar

# Hugging Face Spaces expects 7860
EXPOSE 7860

# Set server to use the prod profile and dynamic port
ENV SPRING_PROFILES_ACTIVE=prod
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+TieredCompilation -XX:TieredStopAtLevel=1 -Xss256k"

# Use shell form for ENTRYPOINT to support environment variable expansion if needed, 
# or use simpler exec form without hardcoded memory limits to let JVM detect container limits.
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
