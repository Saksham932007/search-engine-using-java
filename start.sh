#!/bin/bash

# Java Search Engine Start Script

set -e

echo "🚀 Starting Java Search Engine..."

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

# Check if Docker is available
if command -v docker-compose &> /dev/null; then
    print_step "🐳 Starting with Docker Compose..."
    
    if [ -f "docker-compose.yml" ]; then
        print_step "Starting production environment..."
        docker-compose up -d
        
        print_success "✅ Application started successfully!"
        echo ""
        echo "🌐 Access points:"
        echo "  Frontend:  http://localhost:3000"
        echo "  Backend:   http://localhost:8080"
        echo "  API Docs:  http://localhost:8080/api"
        echo ""
        echo "📊 To view logs: docker-compose logs -f"
        echo "🛑 To stop:      docker-compose down"
        
    else
        print_error "❌ docker-compose.yml not found"
        exit 1
    fi
    
elif command -v java &> /dev/null && command -v node &> /dev/null; then
    print_step "🔧 Starting manually..."
    
    # Start backend
    print_step "Starting backend..."
    cd backend
    
    # Check if JAR exists
    if [ -f "target/java-search-engine-1.0.0.jar" ]; then
        nohup java -jar target/java-search-engine-1.0.0.jar > ../backend.log 2>&1 &
        BACKEND_PID=$!
        echo $BACKEND_PID > ../backend.pid
        print_success "✅ Backend started (PID: $BACKEND_PID)"
    else
        print_error "❌ Backend JAR not found. Run ./build.sh first."
        exit 1
    fi
    
    cd ..
    
    # Wait for backend to start
    sleep 5
    
    # Start frontend
    print_step "Starting frontend..."
    cd frontend
    
    if [ -d "build" ]; then
        npx serve -s build -l 3000 > ../frontend.log 2>&1 &
        FRONTEND_PID=$!
        echo $FRONTEND_PID > ../frontend.pid
        print_success "✅ Frontend started (PID: $FRONTEND_PID)"
    else
        print_error "❌ Frontend build not found. Run ./build.sh first."
        kill $BACKEND_PID 2>/dev/null || true
        exit 1
    fi
    
    cd ..
    
    print_success "✅ Application started successfully!"
    echo ""
    echo "🌐 Access points:"
    echo "  Frontend:  http://localhost:3000"
    echo "  Backend:   http://localhost:8080"
    echo "  API Docs:  http://localhost:8080/api"
    echo ""
    echo "📊 To view logs:"
    echo "  Backend:   tail -f backend.log"
    echo "  Frontend:  tail -f frontend.log"
    echo ""
    echo "🛑 To stop: ./stop.sh"
    
else
    print_error "❌ Neither Docker nor Java/Node.js found"
    print_error "Please install Docker Compose or Java 17+ and Node.js 18+"
    exit 1
fi