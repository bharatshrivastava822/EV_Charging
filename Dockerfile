# =======================================================
# ChargerGo 2.0 Backend Dockerfile
# Use this when Render Root Directory is empty or root "/"
# =======================================================

# Stage 1: Build the packaged Spring Boot artifact
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy Maven descriptor
COPY backend/pom.xml ./pom.xml

# Cache dependencies
RUN mvn dependency:go-offline -B || true

# Copy backend source code and build executable jar
COPY backend/src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Minimal, secure JRE runtime
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Ensure non-root container user owns /app and /app/data
RUN groupadd -r chargergo && useradd -r -g chargergo -d /app chargergo \
    && mkdir -p /app/data \
    && chown -R chargergo:chargergo /app

USER chargergo:chargergo

# Copy artifact from build stage
COPY --from=build --chown=chargergo:chargergo /app/target/ev-charging-booking-1.0.0.jar app.jar

# Render assigns dynamic PORT environment variable (defaults to 8080)
ENV PORT=8080
EXPOSE 8080

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=45s --retries=3 \
  CMD curl -f http://localhost:${PORT:-8080}/api/health || exit 1

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-Dserver.port=${PORT}", "-jar", "app.jar"]

