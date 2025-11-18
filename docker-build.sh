#!/bin/bash
# Spring Boot 프로젝트 빌드 및 Docker Compose 실행 스크립트

echo "========================================"
echo "Spring Boot JAR 파일 빌드 중..."
echo "========================================"

# Gradle 빌드
./gradlew clean build -x test

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================"
    echo "빌드 성공! Docker Compose 실행 중..."
    echo "========================================"
    echo ""
    
    # Docker Compose 실행
    docker-compose up --build
else
    echo ""
    echo "========================================"
    echo "빌드 실패! Docker Compose를 실행하지 않습니다."
    echo "========================================"
    exit 1
fi

