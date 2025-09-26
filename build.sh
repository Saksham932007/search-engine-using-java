#!/bin/bash

# Java Search Engine Build Script

set -e

echo "🚀 Building Java Search Engine..."

# Function to print colored output
print_step() {
    echo -e "\033[1;34m$1\033[0m"
}

print_success() {
    echo -e "\033[1;32m$1\033[0m"
}

print_error() {
    echo -e "\033[1;31m$1\033[0m"
}

# Check prerequisites
print_step "📋 Checking prerequisites..."

if ! command -v java &> /dev/null; then
    print_error "Java is not installed. Please install Java 17 or higher."
    exit 1
fi

if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker for containerized deployment."
fi

print_success "✅ Prerequisites check completed"

# Build backend
print_step "🔨 Building backend..."
cd backend

# Check if mvnw exists, if not use system maven
if [ -f "./mvnw" ]; then
    chmod +x ./mvnw
    ./mvnw clean package -DskipTests
else
    mvn clean package -DskipTests
fi

if [ $? -eq 0 ]; then
    print_success "✅ Backend build successful"
else
    print_error "❌ Backend build failed"
    exit 1
fi

cd ..

# Build frontend
print_step "🔨 Building frontend..."
cd frontend

npm ci --silent

if [ $? -eq 0 ]; then
    print_success "✅ Frontend dependencies installed"
else
    print_error "❌ Frontend dependency installation failed"
    exit 1
fi

npm run build

if [ $? -eq 0 ]; then
    print_success "✅ Frontend build successful"
else
    print_error "❌ Frontend build failed"
    exit 1
fi

cd ..

# Build Docker images if Docker is available
if command -v docker &> /dev/null; then
    print_step "🐳 Building Docker images..."
    
    docker build -f backend.Dockerfile -t search-engine-backend:latest .
    if [ $? -eq 0 ]; then
        print_success "✅ Backend Docker image built"
    else
        print_error "❌ Backend Docker image build failed"
    fi
    
    docker build -f frontend.Dockerfile -t search-engine-frontend:latest .
    if [ $? -eq 0 ]; then
        print_success "✅ Frontend Docker image built"
    else
        print_error "❌ Frontend Docker image build failed"
    fi
fi

print_step "📊 Build Summary"
echo "Backend JAR: backend/target/java-search-engine-1.0.0.jar"
echo "Frontend build: frontend/build/"
echo "Docker images: search-engine-backend:latest, search-engine-frontend:latest"

print_success "🎉 Build completed successfully!"
print_step "🚀 To start the application:"
echo "  Development: docker-compose -f docker-compose.dev.yml up -d"
echo "  Production:  docker-compose up -d"
echo "  Manual:      ./start.sh"