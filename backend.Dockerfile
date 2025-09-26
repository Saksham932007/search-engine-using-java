# Java Search Engine Backend
FROM openjdk:17-jdk-slim

# Set working directory
WORKDIR /app

# Copy Maven wrapper and pom.xml
COPY backend/mvnw .
COPY backend/.mvn .mvn
COPY backend/pom.xml .

# Download dependencies
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY backend/src src

# Build the application
RUN ./mvnw package -DskipTests

# Create directory for Lucene index
RUN mkdir -p /app/lucene-index

# Expose port
EXPOSE 8080

# Set environment variables
ENV SPRING_PROFILES_ACTIVE=prod
ENV SEARCH_INDEX_DIR=/app/lucene-index

# Run the application
CMD ["java", "-jar", "target/java-search-engine-1.0.0.jar"]