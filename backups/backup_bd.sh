#!/usr/bin/env bash
# Backup completo de SITBT: PostgreSQL + archivos de MinIO
# Uso: ./backups/backup_bd.sh
set -euo pipefail

FECHA="$(date +%Y%m%d_%H%M%S)"
DESTINO="$(cd "$(dirname "$0")" && pwd)/completo_${FECHA}"
CONTENEDOR_PG="sitbt_postgres"
VOLUMEN_MINIO="sitbt_minio_data"
DB="sitbt_db"
USUARIO="sitbt"

mkdir -p "$DESTINO"

echo "[1/5] Dump comprimido (formato custom, para pg_restore)..."
docker exec "$CONTENEDOR_PG" pg_dump -U "$USUARIO" -d "$DB" -Fc \
  > "$DESTINO/bd_sitbt.dump"

echo "[2/5] Dump SQL plano comprimido (legible)..."
docker exec "$CONTENEDOR_PG" pg_dump -U "$USUARIO" -d "$DB" --clean --if-exists \
  | gzip -9 > "$DESTINO/bd_sitbt.sql.gz"

echo "[3/5] Roles y privilegios globales..."
docker exec "$CONTENEDOR_PG" pg_dumpall -U "$USUARIO" --globals-only \
  > "$DESTINO/roles_globales.sql"

echo "[4/5] Volumen físico de MinIO (copia exacta, para restaurar tal cual)..."
docker run --rm -v "${VOLUMEN_MINIO}:/data:ro" alpine:latest tar czf - -C /data . \
  > "$DESTINO/minio_archivos.tar.gz"

echo "[5/5] Exportación legible de los archivos de MinIO..."
node "$(cd "$(dirname "$0")" && pwd)/exportar_minio.js" "$DESTINO/archivos_minio" \
  || { echo "⚠️  No se pudo exportar MinIO (¿servicio apagado?). El tar físico sí quedó guardado."; }

echo "Generando checksums..."
( cd "$DESTINO" && find . -type f -not -name SHA256SUMS.txt -exec sha256sum {} + | sort -k2 > SHA256SUMS.txt )

# Verificar que los dumps sean válidos
docker exec -i "$CONTENEDOR_PG" pg_restore --list < "$DESTINO/bd_sitbt.dump" > /dev/null

echo
echo "✅ Backup completado en: $DESTINO"
ls -lh "$DESTINO"
