#!/bin/bash

# Apartments Listing Application - Docker Startup Script
# This script helps you start the application in different modes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to check if ports are available
check_ports() {
    local ports=("3000" "3001" "27017")
    for port in "${ports[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            print_warning "Port $port is already in use. Please stop the service using this port or the application may not work correctly."
        fi
    done
}

# Function to start development environment
start_dev() {
    print_status "Starting Apartments Listing Application in Development Mode..."
    
    # Create environment files if they don't exist
    if [ ! -f backend/.env ]; then
        print_status "Creating backend environment file..."
        cp backend/.env.example backend/.env
    fi
    
    if [ ! -f frontend/.env.local ]; then
        print_status "Creating frontend environment file..."
        cp frontend/.env.local.example frontend/.env.local
    fi
    
    # Start services
    docker-compose up --build
}

# Function to start production environment
start_prod() {
    print_status "Starting Apartments Listing Application in Production Mode..."
    
    # Check for production environment variables
    if [ -z "$JWT_SECRET" ]; then
        print_warning "JWT_SECRET environment variable is not set. Using default (not secure for production)."
    fi
    
    if [ -z "$MONGO_PASSWORD" ]; then
        print_warning "MONGO_PASSWORD environment variable is not set. Using default password."
    fi
    
    # Start services
    docker-compose -f docker-compose.prod.yml up --build
}

# Function to seed the database
seed_database() {
    print_status "Seeding the database with sample data..."
    
    # Wait for backend to be healthy
    print_status "Waiting for backend service to be ready..."
    timeout 120 bash -c 'until docker-compose exec backend curl -f http://localhost:3001/health > /dev/null 2>&1; do sleep 2; done'
    
    # Run seed script
    docker-compose exec backend npm run seed
    print_success "Database seeded successfully!"
}

# Function to stop all services
stop_services() {
    print_status "Stopping all services..."
    docker-compose down
    docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
    print_success "All services stopped."
}

# Function to clean up everything
cleanup() {
    print_status "Cleaning up Docker containers, volumes, and images..."
    docker-compose down -v --rmi all
    docker-compose -f docker-compose.prod.yml down -v --rmi all 2>/dev/null || true
    print_success "Cleanup completed."
}

# Function to show logs
show_logs() {
    local service=${1:-""}
    if [ -n "$service" ]; then
        docker-compose logs -f "$service"
    else
        docker-compose logs -f
    fi
}

# Function to show application status
show_status() {
    print_status "Application Status:"
    echo ""
    docker-compose ps
    echo ""
    print_status "Application URLs:"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend:  http://localhost:3001"
    echo "  Health:   http://localhost:3001/health"
    echo ""
    print_status "Database Connection:"
    echo "  MongoDB:  mongodb://admin:password@localhost:27017/apartments_db"
}

# Main script logic
case "${1:-help}" in
    "dev")
        check_docker
        check_ports
        start_dev
        ;;
    "prod")
        check_docker
        check_ports
        start_prod
        ;;
    "seed")
        seed_database
        ;;
    "stop")
        stop_services
        ;;
    "cleanup")
        cleanup
        ;;
    "logs")
        show_logs "${2:-}"
        ;;
    "status")
        show_status
        ;;
    "help"|*)
        echo ""
        echo "🏠 Apartments Listing Application - Docker Management Script"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  dev      Start the application in development mode (with hot reload)"
        echo "  prod     Start the application in production mode"
        echo "  seed     Seed the database with sample data"
        echo "  stop     Stop all running services"
        echo "  cleanup  Remove all containers, volumes, and images"
        echo "  logs     Show logs for all services (or specify service name)"
        echo "  status   Show current status of all services"
        echo "  help     Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0 dev                 # Start in development mode"
        echo "  $0 prod                # Start in production mode"
        echo "  $0 seed                # Seed database with sample data"
        echo "  $0 logs backend        # Show backend logs only"
        echo "  $0 status              # Check application status"
        echo ""
        echo "Quick Start:"
        echo "  1. $0 dev              # Start the application"
        echo "  2. $0 seed             # Add sample data (in another terminal)"
        echo "  3. Visit http://localhost:3000 to use the application"
        echo ""
        ;;
esac
