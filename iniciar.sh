#!/bin/bash

set -e

echo "=== SITBT - Iniciando Sistema ==="

cd "$(dirname "$0")"

echo "[1/5] Iniciando servicios Docker (PostgreSQL, Redis, MinIO)..."
docker compose up -d

echo "[2/5] Esperando a que los servicios estén disponibles..."
sleep 5

echo "[3/5] Instalando dependencias del backend..."
cd backend
npm install

echo "[4/5] Ejecutando seed (usuario admin)..."
npm run seed

echo "[5/5] Iniciando backend y frontend..."
npm run start:dev &
BACKEND_PID=$!
cd ..

cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "=== Sistema iniciado ==="
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:3001"
echo "MinIO Console: http://localhost:9001"
echo ""
echo "Credenciales iniciales:"
echo "  Usuario: admin"
echo "  Contraseña: admin123"
echo ""
echo "Presiona Ctrl+C para detener"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; docker compose down; exit" SIGINT SIGTERM

wait
