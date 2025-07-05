# PowerShell script to build and upload Docker images to DockerHub
# Make sure you're logged in to DockerHub: docker login

Write-Host "Starting Docker image build and upload process..." -ForegroundColor Green

# Set variables
$BACKEND_IMAGE = "felipec03/evaluacion3backend"
$FRONTEND_IMAGE = "felipec03/evaluacion3frontend"
$TAG = "latest"

# Check if Docker is running
try {
    docker version | Out-Null
    Write-Host "Docker is running..." -ForegroundColor Green
} catch {
    Write-Host "Error: Docker is not running or not installed!" -ForegroundColor Red
    exit 1
}

# Check if user is logged in to DockerHub
Write-Host "Checking DockerHub login status..." -ForegroundColor Yellow
$loginCheck = docker info 2>&1 | Select-String "Username"
if (-not $loginCheck) {
    Write-Host "Warning: You may not be logged in to DockerHub. Run 'docker login' if needed." -ForegroundColor Yellow
    Read-Host "Press Enter to continue or Ctrl+C to cancel"
}

# Build and push backend image
Write-Host "`nBuilding backend image..." -ForegroundColor Cyan
Set-Location "backend"
docker build -t ${BACKEND_IMAGE}:${TAG} .
if ($LASTEXITCODE -eq 0) {
    Write-Host "Backend image built successfully!" -ForegroundColor Green
    
    Write-Host "Pushing backend image to DockerHub..." -ForegroundColor Cyan
    docker push ${BACKEND_IMAGE}:${TAG}
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Backend image pushed successfully!" -ForegroundColor Green
    } else {
        Write-Host "Error pushing backend image!" -ForegroundColor Red
        Set-Location ".."
        exit 1
    }
} else {
    Write-Host "Error building backend image!" -ForegroundColor Red
    Set-Location ".."
    exit 1
}

# Return to root directory
Set-Location ".."

# Build and push frontend image
Write-Host "`nBuilding frontend image..." -ForegroundColor Cyan
Set-Location "frontend"
docker build -t ${FRONTEND_IMAGE}:${TAG} .
if ($LASTEXITCODE -eq 0) {
    Write-Host "Frontend image built successfully!" -ForegroundColor Green
    
    Write-Host "Pushing frontend image to DockerHub..." -ForegroundColor Cyan
    docker push ${FRONTEND_IMAGE}:${TAG}
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Frontend image pushed successfully!" -ForegroundColor Green
    } else {
        Write-Host "Error pushing frontend image!" -ForegroundColor Red
        Set-Location ".."
        exit 1
    }
} else {
    Write-Host "Error building frontend image!" -ForegroundColor Red
    Set-Location ".."
    exit 1
}

# Return to root directory
Set-Location ".."

Write-Host "`n=== UPLOAD COMPLETE ===" -ForegroundColor Green
Write-Host "Backend image: ${BACKEND_IMAGE}:${TAG}" -ForegroundColor White
Write-Host "Frontend image: ${FRONTEND_IMAGE}:${TAG}" -ForegroundColor White
Write-Host "`nYou can now update your docker-compose.yml file to use these images." -ForegroundColor Yellow
Write-Host "Or run: docker-compose pull && docker-compose up -d" -ForegroundColor Yellow
