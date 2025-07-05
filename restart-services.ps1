# PowerShell script to properly restart the Docker Compose services
# This script addresses the database initialization and frontend configuration issues

Write-Host "Stopping and cleaning up existing containers..." -ForegroundColor Yellow
docker-compose down -v

Write-Host "Removing any existing images (optional - uncomment if needed)..." -ForegroundColor Yellow
# Uncomment the following lines if you want to rebuild images from scratch
# docker rmi felipec03/evaluacion3backend:latest -f
# docker rmi felipec03/evaluacion3frontend:latest -f

Write-Host "Starting PostgreSQL database first..." -ForegroundColor Cyan
docker-compose up -d postgres

Write-Host "Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "Starting backend services..." -ForegroundColor Cyan
# Start backend-1 first (it will initialize the database)
docker-compose up -d backend-1

Write-Host "Waiting for backend-1 to initialize database..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

# Start other backend instances
docker-compose up -d backend-2 backend-3

Write-Host "Starting frontend..." -ForegroundColor Cyan
docker-compose up -d frontend

Write-Host "Starting NGINX gateway..." -ForegroundColor Cyan
docker-compose up -d nginx

Write-Host "`n=== DEPLOYMENT COMPLETE ===" -ForegroundColor Green
Write-Host "Your application should be available at: http://localhost" -ForegroundColor White
Write-Host "`nTo view logs, run:" -ForegroundColor Yellow
Write-Host "  docker-compose logs -f" -ForegroundColor White
Write-Host "`nTo check service status:" -ForegroundColor Yellow
Write-Host "  docker-compose ps" -ForegroundColor White
