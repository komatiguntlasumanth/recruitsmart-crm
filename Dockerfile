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

# Download dependencies first (cached layer — only re-runs if pom.xml changes)
COPY backend/pom.xml ./
RUN mvn dependency:go-offline -B --no-transfer-progress -q

# Copy source and frontend build
COPY backend/src ./src
COPY --from=frontend-build /app/frontend/dist ./src/main/resources/static

# Build the JAR (memory capped for HF build environment ~2GB limit)
ENV MAVEN_OPTS="-Xmx512m -XX:MaxMetaspaceSize=192m -XX:+UseSerialGC"
RUN mvn clean package -DskipTests -B --no-transfer-progress

# Stage 3: Run the application
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=backend-build /app/backend/target/*.jar app.jar

# Use the PORT environment variable (Render/Koyeb default to 10000 if not set)
ENV PORT=${PORT:-10000}
EXPOSE $PORT

ENV SPRING_PROFILES_ACTIVE=prod
# Optimized JVM settings for cloud free-tiers
ENV JAVA_OPTS="-Xmx384m -Xms128m -XX:+UseSerialGC -Djava.security.egd=file:/dev/./urandom"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Dserver.port=$PORT -jar app.jar"]
