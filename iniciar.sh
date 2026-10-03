#!/bin/bash

set -e

MODO=${1:-dev}

echo "=== SITBT - Iniciando Sistema ==="
echo "Modo: $MODO"
echo ""

cd "$(dirname "$0")"

if [ "$MODO" = "prod" ] || [ "$MODO" = "production" ]; then
    echo "[PRODUCCIÓN] Usando Docker Compose"
    echo ""

    echo "[1/2] Iniciando servicios con Docker Compose..."
    docker compose up -d --build

    echo ""
    echo "=== Sistema iniciado en producción ==="
    echo "Sitio: http://localhost"
    echo "Swagger API: http://localhost/api/docs"
    echo ""
    echo "Para detener: docker compose down"
    echo ""

else
    echo "[DESARROLLO] Iniciando en modo desarrollo"
    echo ""

    echo "[1/6] Iniciando servicios Docker (PostgreSQL, Redis, MinIO)..."
    docker compose up -d

    echo "[2/6] Esperando a que los servicios estén disponibles..."
    sleep 5

    echo "[3/6] Instalando dependencias del backend..."
    cd backend
    npm install

    echo "[4/6] Verificando base de datos..."

    # Verificar si ya existe el usuario admin
    ADMIN_EXISTS=$(PGPASSWORD=sitbt_password psql -h localhost -p 5434 -U sitbt -d sitbt_db -t -c "SELECT COUNT(*) FROM users WHERE username = 'admin';" 2>/dev/null || echo "0")
    ADMIN_EXISTS=$(echo $ADMIN_EXISTS | tr -d ' ')

    if [ "$ADMIN_EXISTS" -eq "0" ]; then
      echo "  - Ejecutando seed (creando usuario admin)..."
      DB_HOST=localhost DB_PORT=5434 npm run seed
    else
      echo "  - Usuario admin ya existe, omitiendo seed"
    fi

    # Verificar si hay estudiantes/personal sin usuario
    STUDENTS_WITHOUT_USER=$(PGPASSWORD=sitbt_password psql -h localhost -p 5434 -U sitbt -d sitbt_db -t -c "
      SELECT COUNT(*) FROM students s
      LEFT JOIN users u ON s.person_id = u.person_id
      WHERE u.id IS NULL;
    " 2>/dev/null || echo "0")
    STUDENTS_WITHOUT_USER=$(echo $STUDENTS_WITHOUT_USER | tr -d ' ')

    STAFF_WITHOUT_USER=$(PGPASSWORD=sitbt_password psql -h localhost -p 5434 -U sitbt -d sitbt_db -t -c "
      SELECT COUNT(*) FROM staff s
      LEFT JOIN users u ON s.person_id = u.person_id
      WHERE u.id IS NULL;
    " 2>/dev/null || echo "0")
    STAFF_WITHOUT_USER=$(echo $STAFF_WITHOUT_USER | tr -d ' ')

    TOTAL_WITHOUT_USER=$((STUDENTS_WITHOUT_USER + STAFF_WITHOUT_USER))

    if [ "$TOTAL_WITHOUT_USER" -gt "0" ]; then
      echo "  - Encontrados $STUDENTS_WITHOUT_USER estudiantes y $STAFF_WITHOUT_USER personal sin usuario"
      echo "  - Ejecutando generación de usuarios..."
      DB_HOST=localhost DB_PORT=5434 npm run generate-users
    else
      echo "  - Todos los estudiantes y personal ya tienen usuario"
    fi

    echo "[5/6] Iniciando backend..."
    DB_HOST=localhost DB_PORT=5434 REDIS_HOST=localhost REDIS_PORT=6380 MINIO_ENDPOINT=localhost MINIO_PORT=9010 BACKEND_URL=http://localhost:4000 npm run start:dev &
    BACKEND_PID=$!
    cd ..

    echo "[6/6] Iniciando frontend..."
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..

    echo ""
    echo "=== Sistema iniciado en desarrollo ==="
    echo "Frontend: http://localhost:3000"
    echo "Backend API: http://localhost:4000"
    echo "Swagger API: http://localhost:4000/api/docs"
    echo "MinIO Console: http://localhost:9011"
    echo ""
    echo "Credenciales iniciales:"
    echo "  Usuario: admin"
    echo "  Contraseña: admin123"
    echo ""
    echo "Presiona Ctrl+C para detener"

    trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; docker compose down; exit" SIGINT SIGTERM

    wait
fi
