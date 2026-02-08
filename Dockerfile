# Stage 1: Build the frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
# Use longer timeout for npm to handle slow networks
RUN npm config set fetch-retry-maxtimeout 600000 
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build the backend
FROM maven:3.9.6-eclipse-temurin-17-alpine AS backend-build
WORKDIR /app/backend
# Set memory limits for Maven build
ENV MAVEN_OPTS="-Xmx1024m -XX:MaxMetaspaceSize=256m"
COPY backend/pom.xml ./
COPY backend/src ./src
RUN mkdir -p src/main/resources/static
COPY --from=frontend-build /app/frontend/dist/ src/main/resources/static/

# Build the jar
RUN mvn clean package -DskipTests -B

# Stage 3: Run the application
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
# Explicit copy to ensure exactly one jar is picked
COPY --from=backend-build /app/backend/target/recruitsmart-crm-0.0.1-SNAPSHOT.jar app.jar

# Hugging Face Spaces expects 7860
EXPOSE 7860

ENV SPRING_PROFILES_ACTIVE=prod
# Ultra-Nuclear Memory Optimization for Hugging Face (SerialGC is best for low RAM)
ENV JAVA_OPTS="-Xmx180m -Xms180m -Xss256k -XX:MaxMetaspaceSize=80m -XX:+UseSerialGC -XX:MaxMetaspaceSize=64m"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
