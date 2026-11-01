#!/usr/bin/env bash
# =============================================================================
# SITBT - Dejar el sistema en blanco para pruebas
#
# Borra TODOS los datos de PostgreSQL, MinIO y Redis.
# Antes de borrar genera un backup completo en backups/completo_<fecha>/.
#
# Uso:
#   ./reiniciar_datos.sh                 # pide confirmación y deja todo vacío
#   ./reiniciar_datos.sh --con-admin     # además crea admin/admin123 (solo ese rol)
#   ./reiniciar_datos.sh --sin-backup    # NO hace backup (¡peligroso!)
#   ./reiniciar_datos.sh --si            # no pide confirmación
#
# Qué hace:
#   1. (opcional) Backup completo con backups/backup_bd.sh
#   2. Detiene el backend en desarrollo (proceso nest --watch)
#   3. Borra y recrea la base de datos sitbt_db
#   4. Vacía el bucket de MinIO
#   5. Vacía Redis
#   6. (opcional) Crea el usuario admin con su rol (semilla mínima)
#   7. Vuelve a levantar el backend (recrea las 39 tablas vacías)
# =============================================================================
set -euo pipefail

RAIZ="$(cd "$(dirname "$0")" && pwd)"
BACKEND="$RAIZ/backend"
CONTENEDOR_PG="sitbt_postgres"
CONTENEDOR_REDIS="sitbt_redis"
DB="sitbt_db"
USUARIO="sitbt"

CON_ADMIN=0
CON_BACKUP=1
SIN_PREGUNTAR=0

for arg in "$@"; do
  case "$arg" in
    --con-admin) CON_ADMIN=1 ;;
    --sin-backup) CON_BACKUP=0 ;;
    --si|-y) SIN_PREGUNTAR=1 ;;
    -h|--help) sed -n '2,26p' "$0"; exit 0 ;;
    *) echo "Opción desconocida: $arg (usa --help)"; exit 1 ;;
  esac
done

info() { echo -e "\033[1;34m==>\033[0m $*"; }
ok()   { echo -e "\033[1;32m  ✓\033[0m $*"; }
warn() { echo -e "\033[1;33m  !\033[0m $*"; }

if [[ $SIN_PREGUNTAR -eq 0 ]]; then
  echo
  echo "⚠️  Esto BORRA TODOS LOS DATOS de la base, MinIO y Redis."
  [[ $CON_BACKUP -eq 1 ]] && echo "    Antes se guardará un backup en backups/completo_<fecha>/."
  [[ $CON_ADMIN -eq 1 ]] && echo "    Después se creará el usuario admin / admin123." || echo "    Quedará SIN usuarios: no se podrá iniciar sesión."
  read -r -p "¿Continuar? [escribe SI]: " respuesta
  [[ "$respuesta" == "SI" || "$respuesta" == "si" ]] || { echo "Cancelado."; exit 1; }
fi

# -------- 1. Backup -----------------------------------------------------------
if [[ $CON_BACKUP -eq 1 ]]; then
  info "Generando backup de seguridad..."
  "$RAIZ/backups/backup_bd.sh" | tail -3
  ok "Backup guardado"
fi

# -------- 2. Detener backend dev ---------------------------------------------
info "Deteniendo backend de desarrollo (si está corriendo)..."
pkill -f "$BACKEND/node_modules/.bin/nest start --watch" 2>/dev/null || true
# Liberar el puerto 4000 si quedó algún proceso escuchando
PIDS_PUERTO=$(ss -ltnp 2>/dev/null | awk '/:4000 /{print $0}' | grep -oP 'pid=\K[0-9]+' | sort -u || true)
if [[ -n "$PIDS_PUERTO" ]]; then
  # shellcheck disable=SC2086
  kill $PIDS_PUERTO 2>/dev/null || true
fi
sleep 2
ok "Backend detenido"

# -------- 3. Base de datos ----------------------------------------------------
info "Recreando la base de datos $DB..."
docker exec "$CONTENEDOR_PG" psql -U "$USUARIO" -d postgres -q \
  -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='$DB' AND pid <> pg_backend_pid();" \
  -c "DROP DATABASE IF EXISTS $DB;" \
  -c "CREATE DATABASE $DB OWNER $USUARIO;"
ok "Base de datos vacía (el esquema lo recrea el backend al arrancar)"

# -------- 4. MinIO ------------------------------------------------------------
info "Vaciando MinIO..."
node -e "
const Minio=require('$BACKEND/node_modules/minio');
const c=new Minio.Client({endPoint:'localhost',port:${MINIO_PORT:-9010},useSSL:false,accessKey:'${MINIO_ACCESS_KEY:-minioadmin}',secretKey:'${MINIO_SECRET_KEY:-minioadmin123}'});
(async()=>{
  const o=[]; for await(const x of c.listObjectsV2('${MINIO_BUCKET:-sitbt-files}','',true)) o.push(x.name);
  for(const k of o) await c.removeObject('${MINIO_BUCKET:-sitbt-files}',k);
  console.log('  ✓ '+o.length+' objetos eliminados');
})().catch(e=>{console.error('  ! Error:',e.message);process.exit(1)})
"
ok "MinIO vacío"

# -------- 5. Redis ------------------------------------------------------------
info "Vaciando Redis..."
docker exec "$CONTENEDOR_REDIS" redis-cli FLUSHALL >/dev/null
ok "Redis vacío"

# -------- 6. Admin (opcional) -------------------------------------------------
if [[ $CON_ADMIN -eq 1 ]]; then
  info "Creando usuario admin (semilla mínima)..."
  ( cd "$BACKEND" && DB_HOST=localhost DB_PORT=5434 npm run semilla:admin --silent )
  ok "Admin creado: admin / admin123"
fi

# -------- 7. Levantar backend -------------------------------------------------
info "Levantando backend..."
mkdir -p /tmp/opencode
( cd "$BACKEND" && \
  DB_HOST=localhost DB_PORT=5434 \
  REDIS_HOST=localhost REDIS_PORT=6380 \
  MINIO_ENDPOINT=localhost MINIO_PORT=9010 \
  BACKEND_URL=http://localhost:4000 \
  setsid nohup npm run start:dev > /tmp/opencode/sitbt-backend.log 2>&1 & )

for _ in $(seq 1 40); do
  ss -ltn 2>/dev/null | grep -q ':4000' && break
  sleep 2
done

if ss -ltn 2>/dev/null | grep -q ':4000'; then
  ok "Backend escuchando en http://localhost:4000"
else
  warn "El backend no arrancó todavía. Revisa: tail -f /tmp/opencode/sitbt-backend.log"
fi

TABLAS=$(docker exec "$CONTENEDOR_PG" psql -U "$USUARIO" -d "$DB" -t -A -c \
  "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';")
echo
echo "✅ Sistema en blanco. Tablas creadas: $TABLAS"
if [[ $CON_ADMIN -eq 1 ]]; then
  echo "   Login: admin / admin123"
else
  echo "   Sin usuarios creados. Para poder entrar:"
  echo "     cd backend && DB_HOST=localhost DB_PORT=5434 npm run semilla:admin"
fi
echo "   API: http://localhost:4000/api/documentacion"
