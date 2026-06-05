#!/bin/bash
# Docker Helper Commands - Linux/Mac
# Usage: ./docker-help.sh <command>

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Colors for output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}➜ $1${NC}"
}

case "$1" in
    start)
        print_info "Starting all services..."
        docker-compose up -d
        print_success "Services started successfully"
        ;;
    
    stop)
        print_info "Stopping all services..."
        docker-compose stop
        print_success "Services stopped"
        ;;
    
    down)
        print_info "Stopping and removing containers..."
        docker-compose down
        print_success "Containers removed"
        ;;
    
    clean)
        print_info "Stopping and removing everything (including volumes)..."
        docker-compose down -v
        print_success "Everything cleaned"
        ;;
    
    restart)
        print_info "Restarting services..."
        docker-compose restart
        print_success "Services restarted"
        ;;
    
    build)
        print_info "Building images..."
        docker-compose build
        print_success "Images built successfully"
        ;;
    
    logs)
        if [ -z "$2" ]; then
            docker-compose logs -f
        else
            docker-compose logs -f "$2"
        fi
        ;;
    
    dev)
        print_info "Starting in development mode..."
        docker-compose -f docker-compose.dev.yml up -d
        print_success "Development environment started"
        ;;
    
    dev-stop)
        print_info "Stopping development environment..."
        docker-compose -f docker-compose.dev.yml down
        print_success "Development environment stopped"
        ;;
    
    dev-logs)
        docker-compose -f docker-compose.dev.yml logs -f
        ;;
    
    ps)
        docker-compose ps
        ;;
    
    stats)
        docker stats
        ;;
    
    bash-frontend)
        print_info "Entering frontend container..."
        docker exec -it interview-ai-frontend sh
        ;;
    
    bash-backend)
        print_info "Entering backend container..."
        docker exec -it interview-ai-backend sh
        ;;
    
    bash-mongo)
        print_info "Entering MongoDB container..."
        docker exec -it interview-ai-mongo mongosh -u admin -p password
        ;;
    
    db-backup)
        print_info "Backing up MongoDB..."
        docker exec interview-ai-mongo mongodump --out /backup --username admin --password password --authenticationDatabase admin
        mkdir -p ./backup
        docker cp interview-ai-mongo:/backup ./backup
        print_success "Database backed up to ./backup"
        ;;
    
    db-restore)
        if [ -z "$2" ]; then
            print_error "Usage: $0 db-restore <backup-path>"
            exit 1
        fi
        print_info "Restoring MongoDB from $2..."
        docker cp "$2" interview-ai-mongo:/restore
        docker exec interview-ai-mongo mongorestore /restore --username admin --password password --authenticationDatabase admin
        print_success "Database restored"
        ;;
    
    test-api)
        print_info "Testing backend API..."
        curl -s http://localhost:3000 && print_success "Backend is responding"
        ;;
    
    test-db)
        print_info "Testing MongoDB connection..."
        docker exec interview-ai-mongo mongosh -u admin -p password --eval "db.adminCommand('ping')"
        print_success "MongoDB is responding"
        ;;
    
    help|*)
        echo "Docker Helper Commands"
        echo ""
        echo "Production Commands:"
        echo "  $0 start              - Start all services"
        echo "  $0 stop               - Stop all services"
        echo "  $0 down               - Stop and remove containers"
        echo "  $0 clean              - Clean everything (including volumes)"
        echo "  $0 restart            - Restart all services"
        echo "  $0 build              - Build all images"
        echo "  $0 ps                 - Show container status"
        echo "  $0 logs [service]     - View logs (e.g., 'backend')"
        echo "  $0 stats              - Show resource usage"
        echo ""
        echo "Development Commands:"
        echo "  $0 dev                - Start in development mode"
        echo "  $0 dev-stop           - Stop development environment"
        echo "  $0 dev-logs           - View development logs"
        echo ""
        echo "Container Access:"
        echo "  $0 bash-frontend      - Enter frontend container"
        echo "  $0 bash-backend       - Enter backend container"
        echo "  $0 bash-mongo         - Enter MongoDB shell"
        echo ""
        echo "Database Commands:"
        echo "  $0 db-backup          - Backup MongoDB"
        echo "  $0 db-restore <path>  - Restore MongoDB from backup"
        echo ""
        echo "Testing:"
        echo "  $0 test-api           - Test backend API"
        echo "  $0 test-db            - Test MongoDB connection"
        echo "  $0 help               - Show this help message"
        ;;
esac
