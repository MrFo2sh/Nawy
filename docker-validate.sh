#!/bin/bash

# Docker Setup Validation Script
# This script validates the Docker configuration and setup

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐳 Docker Setup Validation${NC}"
echo "=============================="

# Check if Docker is installed and running
echo -n "Checking Docker installation... "
if command -v docker >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Docker found${NC}"
else
    echo -e "${RED}✗ Docker not found${NC}"
    exit 1
fi

echo -n "Checking Docker Compose installation... "
if command -v docker-compose >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Docker Compose found${NC}"
else
    echo -e "${RED}✗ Docker Compose not found${NC}"
    exit 1
fi

echo -n "Checking if Docker daemon is running... "
if docker info >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Docker daemon is running${NC}"
else
    echo -e "${RED}✗ Docker daemon is not running${NC}"
    echo "Please start Docker and try again."
    exit 1
fi

# Validate Docker configurations
echo -n "Validating development docker-compose.yml... "
if docker-compose config --quiet; then
    echo -e "${GREEN}✓ Valid configuration${NC}"
else
    echo -e "${RED}✗ Invalid configuration${NC}"
    exit 1
fi

echo -n "Validating production docker-compose.prod.yml... "
if docker-compose -f docker-compose.prod.yml config --quiet; then
    echo -e "${GREEN}✓ Valid configuration${NC}"
else
    echo -e "${RED}✗ Invalid configuration${NC}"
    exit 1
fi

# Check if required files exist
echo -n "Checking required Docker files... "
required_files=(
    "docker-compose.yml"
    "docker-compose.prod.yml"
    "backend/Dockerfile"
    "backend/Dockerfile.dev"
    "frontend/Dockerfile"
    "frontend/Dockerfile.dev"
    "backend/.env.example"
    "frontend/.env.local.example"
    "docker-start.sh"
    "DOCKER.md"
)

missing_files=()
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -eq 0 ]; then
    echo -e "${GREEN}✓ All required files present${NC}"
else
    echo -e "${RED}✗ Missing files:${NC}"
    for file in "${missing_files[@]}"; do
        echo "  - $file"
    done
    exit 1
fi

# Check if startup script is executable
echo -n "Checking docker-start.sh permissions... "
if [ -x "docker-start.sh" ]; then
    echo -e "${GREEN}✓ Script is executable${NC}"
else
    echo -e "${YELLOW}⚠ Script is not executable, fixing...${NC}"
    chmod +x docker-start.sh
    echo -e "${GREEN}✓ Fixed permissions${NC}"
fi

# Check port availability
echo -n "Checking port availability... "
ports_in_use=()
check_ports=(3000 3001 27017)

for port in "${check_ports[@]}"; do
    if lsof -Pi ":$port" -sTCP:LISTEN -t >/dev/null 2>&1; then
        ports_in_use+=("$port")
    fi
done

if [ ${#ports_in_use[@]} -eq 0 ]; then
    echo -e "${GREEN}✓ All ports available${NC}"
else
    echo -e "${YELLOW}⚠ Ports in use: ${ports_in_use[*]}${NC}"
    echo "  You may need to stop services using these ports"
fi

# Summary
echo ""
echo -e "${BLUE}📋 Setup Summary${NC}"
echo "=================="
echo "✓ Docker and Docker Compose are installed and running"
echo "✓ Docker configurations are valid"
echo "✓ All required files are present"
echo "✓ Startup script is ready"

if [ ${#ports_in_use[@]} -eq 0 ]; then
    echo "✓ All ports are available"
else
    echo "⚠ Some ports are in use (see above)"
fi

echo ""
echo -e "${GREEN}🎉 Docker setup is ready!${NC}"
echo ""
echo -e "${BLUE}Quick Start Commands:${NC}"
echo "  ./docker-start.sh dev    # Start development environment"
echo "  ./docker-start.sh seed   # Add sample data"
echo "  ./docker-start.sh status # Check application status"
echo ""
echo -e "${BLUE}Application URLs:${NC}"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:3001"
echo "  Health:   http://localhost:3001/health"
echo ""
echo -e "${BLUE}Test Credentials:${NC}"
echo "  Email:    test@example.com"
echo "  Password: Test123!@#"
