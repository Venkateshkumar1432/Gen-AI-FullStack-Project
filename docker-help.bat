@echo off
REM Docker Helper Commands - Windows
REM Usage: docker-help.bat <command>

setlocal enabledelayedexpansion

if "%1"=="" goto help
if "%1"=="help" goto help

goto %1

:start
echo Starting all services...
docker-compose up -d
echo Services started successfully
goto end

:stop
echo Stopping all services...
docker-compose stop
echo Services stopped
goto end

:down
echo Stopping and removing containers...
docker-compose down
echo Containers removed
goto end

:clean
echo Stopping and removing everything ^(including volumes^)...
docker-compose down -v
echo Everything cleaned
goto end

:restart
echo Restarting services...
docker-compose restart
echo Services restarted
goto end

:build
echo Building images...
docker-compose build
echo Images built successfully
goto end

:logs
if "%2"=="" (
    docker-compose logs -f
) else (
    docker-compose logs -f %2
)
goto end

:dev
echo Starting in development mode...
docker-compose -f docker-compose.dev.yml up -d
echo Development environment started
goto end

:dev-stop
echo Stopping development environment...
docker-compose -f docker-compose.dev.yml down
echo Development environment stopped
goto end

:dev-logs
docker-compose -f docker-compose.dev.yml logs -f
goto end

:ps
docker-compose ps
goto end

:stats
docker stats
goto end

:bash-frontend
echo Entering frontend container...
docker exec -it interview-ai-frontend sh
goto end

:bash-backend
echo Entering backend container...
docker exec -it interview-ai-backend sh
goto end

:bash-mongo
echo Entering MongoDB container...
docker exec -it interview-ai-mongo mongosh -u admin -p password
goto end

:db-backup
echo Backing up MongoDB...
docker exec interview-ai-mongo mongodump --out /backup --username admin --password password --authenticationDatabase admin
if not exist backup mkdir backup
docker cp interview-ai-mongo:/backup ./backup
echo Database backed up to ./backup
goto end

:test-api
echo Testing backend API...
curl -s http://localhost:3000
if !errorlevel! equ 0 echo Backend is responding
goto end

:test-db
echo Testing MongoDB connection...
docker exec interview-ai-mongo mongosh -u admin -p password --eval "db.adminCommand('ping')"
goto end

:help
echo Docker Helper Commands - Windows
echo.
echo Production Commands:
echo   docker-help.bat start              - Start all services
echo   docker-help.bat stop               - Stop all services
echo   docker-help.bat down               - Stop and remove containers
echo   docker-help.bat clean              - Clean everything ^(including volumes^)
echo   docker-help.bat restart            - Restart all services
echo   docker-help.bat build              - Build all images
echo   docker-help.bat ps                 - Show container status
echo   docker-help.bat logs [service]     - View logs (e.g., 'backend')
echo   docker-help.bat stats              - Show resource usage
echo.
echo Development Commands:
echo   docker-help.bat dev                - Start in development mode
echo   docker-help.bat dev-stop           - Stop development environment
echo   docker-help.bat dev-logs           - View development logs
echo.
echo Container Access:
echo   docker-help.bat bash-frontend      - Enter frontend container
echo   docker-help.bat bash-backend       - Enter backend container
echo   docker-help.bat bash-mongo         - Enter MongoDB shell
echo.
echo Database Commands:
echo   docker-help.bat db-backup          - Backup MongoDB
echo.
echo Testing:
echo   docker-help.bat test-api           - Test backend API
echo   docker-help.bat test-db            - Test MongoDB connection
echo   docker-help.bat help               - Show this help message
echo.
goto end

:end
endlocal
