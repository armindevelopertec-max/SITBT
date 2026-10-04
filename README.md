# SITBT - Sistema de Gestión Académica

Sistema de gestión académica para el Instituto Tecnológico Boliviana de Tecnología (ITBT).

## Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                        INTERNET                                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  NGINX (Puerto 80/443) - Único punto de entrada                  │
│  - Proxy reverso                                                  │
│  - Termination SSL                                                │
└──────────────────────────┬──────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │  FRONTEND   │ │   BACKEND   │ │   MINIO     │
    │  (Next.js)  │ │  (NestJS)   │ │  (S3 API)   │
    │  Puerto 3000│ │  Puerto 4000│ │  Puerto 9000│
    └─────────────┘ └─────────────┘ └─────────────┘
           │               │               │
           └───────────────┼───────────────┘
                           ▼
                  ┌─────────────┐
                  │  POSTGRESQL │
                  │  Puerto 5432│
                  └─────────────┘
                           │
                  ┌─────────────┐
                  │    REDIS    │
                  │  Puerto 6379│
                  └─────────────┘
```

**Características de seguridad:**
- Solo puerto **80/443** expuesto a Internet
- Backend, DB, Redis, MinIO solo accesibles en red interna Docker
- Nginx como único gateway con proxy reverso

## Modos de Ejecución

### Producción (`./iniciar.sh prod`)
```bash
./iniciar.sh prod
```
- Build de imágenes Docker
- Frontend compilado (standalone)
- Nginx proxy reverso
- **Solo puerto 80/443 expuesto**
- Acceso: `http://TU_IP` o `http://localhost`

### Desarrollo (`./iniciar.sh dev`)
```bash
./iniciar.sh dev
```
- Servicios en Docker (PostgreSQL, Redis, MinIO, Backend, Nginx)
- Frontend con hot reload en host (`npm run dev`)
- **Puertos expuestos**: 80 (nginx), 3000 (frontend host), 4000 (backend), 5434 (DB), 6380 (Redis), 9010/9011 (MinIO)
- Acceso: `http://localhost:3000` (frontend directo) o `http://localhost` (via nginx)

## Estructura del Proyecto

```
SITBT/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── modules/         # Módulos por dominio
│   │   ├── entities/        # Entidades TypeORM
│   │   └── main.ts          # Entry point
│   ├── Dockerfile
│   └── package.json
├── frontend/                # Next.js App Router
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # Componentes React
│   │   ├── contexts/        # React Context
│   │   └── lib/             # Utilidades (api, auth)
│   ├── Dockerfile
│   ├── next.config.js
│   └── package.json
├── nginx.conf               # Configuración proxy reverso
├── docker-compose.yml       # Orquestación servicios
├── iniciar.sh               # Script de inicio
└── README.md
```

## Variables de Entorno

### Backend (`.env`)
```env
PORT=4000
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=sitbt
DB_PASSWORD=sitbt_password
DB_DATABASE=sitbt_db
JWT_SECRET=tu_secreto_seguro
REDIS_HOST=redis
REDIS_PORT=6379
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_BUCKET=sitbt-files
FRONTEND_URL=http://localhost
```

### Frontend (`.env.local`)
```env
# Desarrollo: descomenta para usar backend directo
# NEXT_PUBLIC_API_URL=http://192.168.100.62:4000

# Producción: dejar vacío (usa /api via nginx)
# NEXT_PUBLIC_API_URL=
```

## Comandos Útiles

```bash
# Producción
./iniciar.sh prod

# Desarrollo
./iniciar.sh dev

# Ver logs
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f nginx

# Parar todo
docker compose down

# Rebuild completo
docker compose down && docker compose up -d --build

# Ver estado contenedores
docker compose ps

# Entrar a contenedor
docker exec -it sitbt_backend sh
docker exec -it sitbt_postgres psql -U sitbt -d sitbt_db
```

## Endpoints Principales

### Público
- `GET /` - Home
- `GET /carreras` - Lista de carreras
- `GET /carreras/:id` - Detalle carrera con malla curricular
- `GET /admision` - Info admisión
- `GET /admision/pre-registro` - Formulario pre-registro
- `GET /instituto` - Info instituto
- `GET /contacto` - Contacto
- `GET /api/institution-settings/public` - Configuración pública (logo, datos)

### Archivos
- `GET /storage/files/:path` - Stream de archivos (logo, documentos)

### Autenticado (requiere JWT)
- `POST /auth/login` - Login
- `GET /api/...` - Endpoints protegidos

## Flujo de Archivos (Logo, Documentos)

1. **Subida**: `POST /api/storage/upload` → MinIO → Retorna `/storage/files/...`
2. **Almacenamiento**: BD guarda ruta relativa `/storage/files/logos/xxx.png`
3. **Visualización**: Frontend usa `<img src="/storage/files/...">`
4. **Proxy**: Nginx → Backend `/storage/files/*` → MinIO stream

## Red Interna

Todos los servicios se comunican via red Docker `sitbt_network`:
- `postgres:5432`
- `redis:6379`
- `minio:9000`
- `backend:4000`
- `frontend:3000`
- `nginx:80`

## Puertos

| Servicio | Puerto Interno | Expuesto | Descripción |
|----------|---------------|----------|-------------|
| nginx | 80 | **80/443** | Proxy reverso (único expuesto) |
| frontend | 3000 | Solo dev | Next.js dev server |
| backend | 4000 | No | NestJS API |
| postgres | 5432 | 5434* | PostgreSQL |
| redis | 6379 | 6380* | Redis cache |
| minio | 9000 | 9010/9011* | S3 API + Console |

*Solo en modo desarrollo

## Credenciales Iniciales

```
Usuario: admin
Contraseña: admin123
```

## MinIO Console (Solo Desarrollo)

`http://localhost:9011` (usuario: minioadmin / minioadmin123)

## Swagger API Docs

`http://localhost/api/docs` (via nginx proxy)

## Tecnologías

**Backend:**
- NestJS 10
- TypeORM + PostgreSQL
- Redis (cache/sesiones)
- MinIO (S3 compatible)
- JWT + Passport
- Swagger/OpenAPI

**Frontend:**
- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- Axios + Zustand
- Lucide React Icons

**Infraestructura:**
- Docker + Docker Compose
- Nginx (proxy reverso)
- PostgreSQL 16
- Redis 7
- MinIO (S3 compatible)