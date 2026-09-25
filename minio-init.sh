#!/bin/bash
set -e

# Esperar a que MinIO esté listo
sleep 5

# Configurar alias
mc alias set local http://localhost:9000 minioadmin minioadmin123

# Crear bucket si no existe
mc mb local/sitbt-files --ignore-existing

# Hacer público el bucket
mc anonymous set download local/sitbt-files

echo "MinIO initialization completed"
