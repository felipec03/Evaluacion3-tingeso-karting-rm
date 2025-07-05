# Script to install dependencies, build the project, and push to Docker Hub

# Navigate to the script's directory (optional, if you run it from elsewhere)
# Push-Location $PSScriptRoot

Write-Host "Step 1: Installing npm dependencies..."
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Error "npm install failed. Exiting."
    exit 1
}
Write-Host "npm install completed successfully."

Write-Host "Step 2: Building the project..."
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "npm run build failed. Exiting."
    exit 1
}
Write-Host "npm run build completed successfully."

$ImageName = "felipec03/frontend"
$ImageTag = "latest"
$FullImageName = "${ImageName}:${ImageTag}"

Write-Host "Step 3: Building Docker image ${FullImageName}..."
docker build -t $FullImageName .
if ($LASTEXITCODE -ne 0) {
    Write-Error "Docker build failed. Exiting."
    exit 1
}
Write-Host "Docker build completed successfully."

Write-Host "Step 4: Pushing Docker image ${FullImageName} to Docker Hub..."
docker push $FullImageName
if ($LASTEXITCODE -ne 0) {
    Write-Error "Docker push failed. Exiting."
    exit 1
}
Write-Host "Docker push completed successfully."

Write-Host "All steps completed successfully!"

# Pop-Location # Uncomment if you used Push-Location