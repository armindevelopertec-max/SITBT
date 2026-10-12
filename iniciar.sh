#!/usr/bin/env bash
# =============================================================================
#  SITBT - Script de inicio
# -----------------------------------------------------------------------------
#  Modos:
#    dev [opciones]        -> Backend + frontend nativos + DB dockerizada
#    prod [opciones]       -> Todo en Docker (incluyendo Caddy reverse proxy)
#
#  Banderas comunes:
#    -h, --help            Mostrar esta ayuda
#    -v, --verbose         Salida detallada (muestra el comando docker compose)
#    -l, --logs            Solo mostrar/continuar logs en vivo (no iniciar)
#    -s, --status          Mostrar estado de servicios y salir
#    --stop                Detener y limpiar todos los servicios
#    --no-cache            Forzar rebuild sin caché (docker compose build --no-cache)
#    --caddy               (dev) Levantar también Caddy como reverse proxy en :80
#    --no-seed             (dev) Saltar creación del usuario admin
#    --no-users            (dev) Saltar generación automática de usuarios
#
#  Ejemplos:
#    ./iniciar.sh dev                # desarrollo clásico (npm run dev)
#    ./iniciar.sh dev --caddy        # dev con Caddy en :80
#    ./iniciar.sh prod               # producción (todo en Docker + Caddy)
#    ./iniciar.sh prod --no-cache    # producción reconstruyendo imágenes
#    ./iniciar.sh --status           # ver el estado actual
#    ./iniciar.sh --stop             # detener todo
# =============================================================================

set -euo pipefail

# -------- Colores (sólo si la salida es una TTY) ------------------------------
if [[ -t 1 ]]; then
  C_RESET=$'\033[0m'
  C_BOLD=$'\033[1m'
  C_BLUE=$'\033[1;34m'
  C_GREEN=$'\033[1;32m'
  C_YELLOW=$'\033[1;33m'
  C_RED=$'\033[1;31m'
  C_CYAN=$'\033[1;36m'
else
  C_RESET=""; C_BOLD=""; C_BLUE=""; C_GREEN=""; C_YELLOW=""; C_RED=""; C_CYAN=""
fi

# -------- Helpers --------------------------------------------------------------
log()    { printf "%b\n" "$*"; }
info()   { log "${C_BLUE}▸${C_RESET} $*"; }
ok()     { log "${C_GREEN}✔${C_RESET} $*"; }
warn()   { log "${C_YELLOW}⚠${C_RESET} $*"; }
err()    { log "${C_RED}✖${C_RESET} $*" >&2; }
title()  { log "${C_BOLD}${C_CYAN}$*${C_RESET}"; }
paso()   { log "${C_BOLD}${C_BLUE}[$1]${C_RESET} $*"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# -------- Dependencias mínimas -------------------------------------------------
require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    err "Falta la dependencia '$1'. Instálala antes de continuar."
    exit 1
  fi
}

verificar_dependencias() {
  require_cmd docker
  if ! docker compose version >/dev/null 2>&1; then
    err "Se requiere 'docker compose' (plugin v2). Actualiza Docker Desktop/Engine."
    exit 1
  fi
}

# -------- Banner ---------------------------------------------------------------
banner() {
  log "${C_BOLD}${C_CYAN}============================================================${C_RESET}"
  log "${C_BOLD}${C_CYAN}   SITBT - Sistema Académico ITBT${C_RESET}"
  log "${C_BOLD}${C_CYAN}   Instituto Tecnológico Boliviana de Tecnología${C_RESET}"
  log "${C_BOLD}${C_CYAN}============================================================${C_RESET}"
  log ""
}

# -------- Uso ------------------------------------------------------------------
uso() {
  # Muestra el bloque de documentación entre los dos comentarios '======'.
  local linea fase=0 count=0
  while IFS= read -r linea; do
    [[ "$linea" == "# "*"======"* ]] && count=$((count+1)) && continue
    if [[ $count -ge 2 ]]; then break; fi
    [[ $count -eq 1 && "$linea" == "# "* ]] && printf "%s\n" "${linea#\# }"
  done < "$0"
  exit 0
}

# -------- Analizar argumentos --------------------------------------------------
MODO=""
VERBOSE=0
USE_LOGS=0
USE_STATUS=0
USE_STOP=0
NO_CACHE=0
WITH_CADDY=0
WITH_SEED=1
WITH_USERS=1

primer_argumento() {
  for arg in "$@"; do
    case "$arg" in
      -h|--help|help|"-?") uso ;;
      dev|prod|production|"")
        if [[ -z "$MODO" ]]; then MODO="$arg"; fi
        ;;
    esac
  done
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help|help|"-?") uso ;;
    dev|prod|production)
      if [[ -z "$MODO" ]]; then MODO="$1"; else err "Modo duplicado: $1"; exit 1; fi ;;
    -v|--verbose) VERBOSE=1 ;;
    -l|--logs)    USE_LOGS=1 ;;
    -s|--status)  USE_STATUS=1 ;;
    --stop)       USE_STOP=1 ;;
    --no-cache)   NO_CACHE=1 ;;
    --caddy)      WITH_CADDY=1 ;;
    --no-seed)    WITH_SEED=0 ;;
    --no-users)   WITH_USERS=0 ;;
    --skip-empty)
      MODO="${MODO:-dev}"
      case "$2" in
        seed) WITH_SEED=0 ;;
        users) WITH_USERS=0 ;;
        *) err "Opción --skip-empty inválida: $2"; exit 1 ;;
      esac
      shift ;;
    *)
      if [[ -z "$MODO" && "$1" != -* && "$1" != "--"* ]]; then
        MODO="$1"
      else
        err "Argumento desconocido: $1"; exit 1
      fi
      ;;
  esac
  shift
done
primer_argumento "$@" 2>/dev/null || true
MODO="${MODO:-dev}"

# -------- Comandos globales (no requieren MODO) -------------------------------
verificar_dependencias 2>/dev/null || exit 1

if [[ $USE_STATUS -eq 1 ]]; then
  banner
  title "Estado de servicios"
  printf "%-22s %-32s %s\n" "SERVICIO" "ESTADO" "PUERTOS"
  docker compose ps --format "{{.Names}}|{{.Status}}|{{.Ports}}" \
    | while IFS='|' read -r n s p; do
        printf "%-22s %-32s %s\n" "$n" "$s" "$p"
      done
  exit 0
fi

if [[ $USE_STOP -eq 1 ]]; then
  banner
  info "Deteniendo todos los servicios SITBT..."
  docker compose down
  ok "Servicios detenidos."
  exit 0
fi

# -------- docker compose con/sin verbose ---------------------------------------
dc() {
  if [[ $VERBOSE -eq 1 ]]; then
    info "(verbose) docker compose $*"
  fi
  docker compose "$@"
}

# -------- Limpieza preventiva de huérfanos ------------------------------------
limpiar_huerfanos() {
  # Elimina contenedores previos del proyecto que estén parados o en mal estado.
  local huerfanos
  huerfanos=$(docker ps -a --filter "label=com.docker.compose.project=sitbt" \
              --filter "status=exited" --format '{{.ID}}' 2>/dev/null || true)
  if [[ -n "$huerfanos" ]]; then
    info "Limpiando contenedores huérfanos del proyecto SITBT..."
    docker rm -f $huerfanos >/dev/null 2>&1 || true
  fi
}

# -------- Liberar puertos ocupados por procesos nativos ------------------------
# En modo 'dev' lanzamos el backend y el frontend con `npm` (no en Docker).
# Si una sesión anterior terminó de forma abrupta, pueden quedar procesos
# `node` huérfanos atascados en los puertos 3000 (Next) y 4000 (Nest), lo
# que provoca 'EADDRINUSE' y un bucle de reinicios con 'nest start --watch'.
liberar_puerto() {
  local puerto="$1"
  local pids
  pids=$(lsof -ti :"$puerto" 2>/dev/null || true)
  if [[ -n "$pids" ]]; then
    warn "Puerto $puerto ocupado por PID(s) $pids. Liberando..."
    # shellcheck disable=SC2086
    kill -9 $pids 2>/dev/null || true
    sleep 1
    if lsof -ti :"$puerto" >/dev/null 2>&1; then
      warn "El puerto $puerto sigue ocupado tras kill -9. Revísalo manualmente."
    else
      ok "Puerto $puerto liberado."
    fi
  fi
}

# Mata procesos del proyecto SITBT que listen en puertos >puerto_base.
# Útil para Next.js, que al hacer fallback puede haber dejado 'next-server'
# enganchados en 3001, 3002, ... aunque el 3000 ya esté libre.
matar_huerfanos_next() {
  local pids
  pids=$(pgrep -f "next-server\\|next dev" 2>/dev/null | grep -v "$$" || true)
  if [[ -n "$pids" ]]; then
    warn "Procesos 'next' huérfanos: $pids. Terminando..."
    # shellcheck disable=SC2086
    kill -9 $pids 2>/dev/null || true
    sleep 1
  fi
}

liberar_puertos_dev() {
  require_cmd lsof
  # Primero, barrido de procesos Next huérfanos (pueden estar en 3001, 3002, ...)
  matar_huerfanos_next
  liberar_puerto 4000  # NestJS backend
  liberar_puerto 3000  # Next.js frontend
}

# -------- Espera activa al healthcheck -----------------------------------------
esperar_servicio() {
  local servicio="$1"; shift
  local max="${1:-30}"
  local n=0
  while [[ $n -lt $max ]]; do
    local cid
    cid=$(docker compose ps -q "$servicio" 2>/dev/null || true)
    if [[ -n "$cid" ]]; then
      local st
      st=$(docker inspect -f '{{.State.Health.Status}}' "$cid" 2>/dev/null || echo "")
      if [[ "$st" == "healthy" ]]; then return 0; fi
      if [[ "$st" == "unhealthy" ]]; then
        err "$servicio está 'unhealthy'. Revisa los logs: dc logs $servicio"
        return 1
      fi
    fi
    sleep 2; n=$((n+2))
  done
  warn "Tiempo de espera agotado para $servicio (continúa de todas formas)"
  return 0
}

# -------- Acciones para MODO dev ----------------------------------------------
start_dev() {
  title "[DESARROLLO] Iniciando servicios"
  log ""

  local paso=1 total=6

  paso "$paso/$total" "Levantando DB, Redis y MinIO en Docker..."
  ((paso++))
  # Apagamos contenedores productivos que ocupan puertos 3000/4000/80 para
  # dejar lugar al backend/frontend (npm) y opcionalmente a Caddy (dev).
  dc stop backend frontend caddy 2>/dev/null || true
  # Además, matamos procesos nativos (npm/node) que hayan podido quedar
  # enganchados a 3000/4000 desde una sesión anterior. Sin esto, 'nest start
  # --watch' entra en bucle con 'EADDRINUSE' al levantar el backend.
  liberar_puertos_dev
  dc up -d postgres redis minio

  paso "$paso/$total" "Esperando servicios base..."
  ((paso++))
  esperar_servicio postgres 30 && ok "PostgreSQL: healthy"
  esperar_servicio redis    30 && ok "Redis: healthy"
  esperar_servicio minio    45 && ok "MinIO: healthy"

  paso "$paso/$total" "Instalando dependencias del backend (si hace falta)..."
  ((paso++))
  if [[ ! -d backend/node_modules ]]; then
    (cd backend && npm install)
  else
    info "node_modules presente, saltando npm install"
  fi

  paso "$paso/$total" "Asegurando usuario administrador..."
  ((paso++))
  if [[ $WITH_SEED -eq 1 ]]; then
    # En dev corremos los scripts npm localmente apuntando al postgres del host
    # (DB_PORT 5434). Esto evita depender de psql local o de un contenedor backend
    # que en prod no expone package.json.
    (cd backend && DB_HOST=localhost DB_PORT=5434 npm run seed)
  else
    info "Saltando seed por --no-seed"
  fi

  paso "$paso/$total" "Iniciando backend NestJS (puerto 4000)..."
  ((paso++))
  # Importante: usar 'bash -c' (no '(...)') para que $! devuelva el PID del
  # proceso 'npm' inmediato, no del subshell que se desvanece.
  bash -c "cd backend && \
    DB_HOST=localhost DB_PORT=5434 \
    REDIS_HOST=localhost REDIS_PORT=6380 \
    MINIO_ENDPOINT=localhost MINIO_PORT=9010 \
    BACKEND_URL=http://localhost:4000 \
    npm run start:dev" &
  BACKEND_PID=$!

  paso "$paso/$total" "Iniciando frontend Next.js (puerto 3000)..."
  ((paso++))
  bash -c "cd frontend && npm run dev" &
  FRONTEND_PID=$!

  # Caddy opcional en dev (necesita puerto 80 libre)
  if [[ $WITH_CADDY -eq 1 ]]; then
    if ss -tln 2>/dev/null | awk '{print $4}' | grep -qE '[:.]80$'; then
      warn "Puerto 80 ocupado. No se levantará Caddy. Libéralo (Apache, etc.) y reintenta."
    else
      info "Levantando Caddy (reverse proxy en :80)..."
      dc up -d --build caddy
      esperar_servicio caddy 30 && ok "Caddy: healthy"
    fi
  fi

  trap_dev
}

trap_dev() {
  trap 'on_exit_dev' SIGINT SIGTERM EXIT

  log ""
  log "${C_BOLD}${C_GREEN}=== Sistema iniciado en DESARROLLO ===${C_RESET}"
  log "  Frontend:    ${C_CYAN}http://localhost:3000${C_RESET}"
  log "  Backend API: ${C_CYAN}http://localhost:4000${C_RESET}"
  log "  Swagger:     ${C_CYAN}http://localhost:4000/api/docs${C_RESET}"
  log "  MinIO:       ${C_CYAN}http://localhost:9011${C_RESET}"
  if [[ $WITH_CADDY -eq 1 ]]; then
    log "  Caddy (80):  ${C_CYAN}http://localhost${C_RESET}"
  fi
  log ""
  log "  ${C_BOLD}Credenciales${C_RESET}"
  log "    Usuario:     admin"
  log "    Contraseña:  admin123"
  log ""
  log "  ${C_BOLD}Ctrl+C${C_RESET} para detener todo."

  wait
}

on_exit_dev() {
  echo
  info "Deteniendo backend/frontend nativos..."
  kill ${BACKEND_PID:-0} ${FRONTEND_PID:-0} 2>/dev/null || true
  wait 2>/dev/null || true
  info "Apagando contenedores docker (sin -v para no perder datos)..."
  dc down >/dev/null 2>&1 || true
  ok "SITBT detenido. Para volver a producción: ./iniciar.sh prod"
  exit 0
}

# -------- Acciones para MODO prod ---------------------------------------------
start_prod() {
  title "[PRODUCCIÓN] Iniciando stack completo"
  log ""

  info "Construyendo imágenes (puede tardar la primera vez)..."
  if [[ $NO_CACHE -eq 1 ]]; then
    dc build --no-cache
  else
    dc build
  fi

  limpiar_huerfanos

  info "Levantando todos los servicios..."
  dc up -d

  # Espera activa (no bloqueante si algún servicio estuviera lento)
  for s in postgres redis minio backend frontend caddy; do
    if dc ps --services | grep -q "^$s$"; then
      esperar_servicio "$s" 60
    fi
  done

  log ""
  log "${C_BOLD}${C_GREEN}=== Sistema iniciado en PRODUCCIÓN ===${C_RESET}"
  log "  Sitio web:  ${C_CYAN}http://localhost${C_RESET}"
  log "  Swagger:    ${C_CYAN}http://localhost/api/docs${C_RESET}"
  log "  (HTTPS automático al configurar dominio en Caddyfile)"
  log ""
  log "  Detener:    ${C_BOLD}./iniciar.sh --stop${C_RESET}"
}

# ============================================================================
# FLUJO PRINCIPAL
# ============================================================================
banner

case "$MODO" in
  prod|production|produccion)
    start_prod
    ;;
  dev|develop|desarrollo|"")
    start_dev
    ;;
  *)
    err "Modo desconocido: $MODO"
    log "Usa: ./iniciar.sh dev | prod"
    exit 1
    ;;
esac

# Si el usuario pidió --logs, hacer attach cuando termine la inicialización.
if [[ $USE_LOGS -eq 1 ]]; then
  info "Adjuntando logs en vivo (Ctrl+C para salir)..."
  dc logs -f
fi
