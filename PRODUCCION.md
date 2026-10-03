# SITBT - Producción con Docker

## Arquitectura

```
Internet → nginx:80 → Frontend (Next.js)
                      → /api/* → Backend (NestJS)
```

Solo el puerto 80/443 está expuesto. El backend es interno.

## Inicio Rápido

```bash
# Modo producción (construye e inicia todo con Docker)
./iniciar.sh prod

# O directamente con docker compose
docker compose up -d --build
```

## URLs

- Sitio web: http://localhost
- Swagger API: http://localhost/api/docs

## Desarrollo

```bash
# Modo desarrollo (servicios separados)
./iniciar.sh dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Swagger: http://localhost:4000/api/docs

## Variables de Entorno

### Backend (.env)
```env
PORT=4000
DB_HOST=postgres
DB_PORT=5432
FRONTEND_URL=http://localhost
```

### Frontend (Dockerfile)
```env
BACKEND_URL=http://backend:4000
NEXT_PUBLIC_API_BASE=
```
