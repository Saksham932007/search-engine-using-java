#!/bin/bash

# Java Search Engine Stop Script

set -e

echo "🛑 Stopping Java Search Engine..."

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

# Check if running with Docker Compose
if command -v docker-compose &> /dev/null && [ -f "docker-compose.yml" ]; then
    # Check if containers are running
    if docker-compose ps | grep -q "Up"; then
        print_step "🐳 Stopping Docker containers..."
        docker-compose down
        print_success "✅ Docker containers stopped"
    else
        print_step "No Docker containers running"
    fi
fi

# Check for manual processes
if [ -f "backend.pid" ]; then
    BACKEND_PID=$(cat backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        print_step "Stopping backend (PID: $BACKEND_PID)..."
        kill $BACKEND_PID
        rm -f backend.pid
        print_success "✅ Backend stopped"
    else
        print_step "Backend process not running"
        rm -f backend.pid
    fi
fi

if [ -f "frontend.pid" ]; then
    FRONTEND_PID=$(cat frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        print_step "Stopping frontend (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID
        rm -f frontend.pid
        print_success "✅ Frontend stopped"
    else
        print_step "Frontend process not running"
        rm -f frontend.pid
    fi
fi

# Clean up any remaining processes
print_step "Cleaning up remaining processes..."
pkill -f "java-search-engine-1.0.0.jar" 2>/dev/null || true
pkill -f "serve -s build" 2>/dev/null || true

print_success "🎉 Java Search Engine stopped successfully!"