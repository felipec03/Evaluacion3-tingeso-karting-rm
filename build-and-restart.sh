#!/bin/bash
# Script para construir y reiniciar los servicios

echo "=== CONSTRUYENDO BACKEND ==="
cd backend
mvn clean package -DskipTests
if [ $? -ne 0 ]; then
    echo "Error en la construcción del backend"
    exit 1
fi
cd ..

echo "=== CONSTRUYENDO FRONTEND ==="
cd frontend
npm run build
if [ $? -ne 0 ]; then
    echo "Error en la construcción del frontend"
    exit 1
fi
cd ..

echo "=== CONSTRUYENDO IMÁGENES DOCKER ==="
docker-compose build

echo "=== REINICIANDO SERVICIOS ==="
docker-compose down
docker-compose up -d

echo "=== VERIFICANDO SERVICIOS ==="
sleep 10
docker-compose ps

echo "=== LOGS DEL BACKEND ==="
docker-compose logs backend | tail -20

echo "=== LOGS DEL FRONTEND ==="
docker-compose logs frontend | tail -10

echo "=== COMPLETADO ==="
echo "Frontend disponible en: http://localhost"
echo "Backend API disponible en: http://localhost/api"
