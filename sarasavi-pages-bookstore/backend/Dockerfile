# ==============================================================================
# Multi-stage Dockerfile for Sarasavi Pages Spring Boot Backend
# Compatible with Render, Railway, AWS ECS, and local Docker
# ==============================================================================

# Stage 1: Build JAR using Maven
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /workspace

# Copy Maven Wrapper & POM
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Copy application sources and build jar
COPY src/ src/
RUN ./mvnw clean package -DskipTests -B

# Stage 2: Runtime image
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Create directory with full permissions for spring user
RUN addgroup -S spring && adduser -S spring -G spring && \
    mkdir -p /app/data /tmp && \
    chown -R spring:spring /app

USER spring:spring

COPY --from=builder /workspace/target/*.jar app.jar

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
