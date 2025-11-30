# Spring Boot project build and Docker Compose execution script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Building Spring Boot JAR files..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

# Gradle build
./gradlew clean build -x test

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Build successful! Running Docker Compose..." -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Run Docker Compose
    docker-compose up --build
}
else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "Build failed! Docker Compose will not be executed." -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    exit 1
}

