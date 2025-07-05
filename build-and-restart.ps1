# PowerShell script para construir y reiniciar los servicios

Write-Host "=== CONSTRUYENDO BACKEND ===" -ForegroundColor Green
Set-Location backend
mvn clean package -DskipTests
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error en la construcción del backend" -ForegroundColor Red
    exit 1
}
Set-Location ..

Write-Host "=== CONSTRUYENDO FRONTEND ===" -ForegroundColor Green
Set-Location frontend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error en la construcción del frontend" -ForegroundColor Red
    exit 1
}
Set-Location ..

Write-Host "=== CONSTRUYENDO IMÁGENES DOCKER ===" -ForegroundColor Green
docker-compose build

Write-Host "=== REINICIANDO SERVICIOS ===" -ForegroundColor Green
docker-compose down
docker-compose up -d

Write-Host "=== VERIFICANDO SERVICIOS ===" -ForegroundColor Green
Start-Sleep -Seconds 10
docker-compose ps

Write-Host "=== LOGS DEL BACKEND ===" -ForegroundColor Green
docker-compose logs backend | Select-Object -Last 20

Write-Host "=== LOGS DEL FRONTEND ===" -ForegroundColor Green
docker-compose logs frontend | Select-Object -Last 10

Write-Host "=== COMPLETADO ===" -ForegroundColor Green
Write-Host "Frontend disponible en: http://localhost" -ForegroundColor Yellow
Write-Host "Backend API disponible en: http://localhost/api" -ForegroundColor Yellow
