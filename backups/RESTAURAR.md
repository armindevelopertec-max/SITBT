# Cómo restaurar un backup de SITBT

Cada carpeta `completo_AAAAAMMDD_HHMMSS/` contiene:

| Archivo | Contenido |
|---|---|
| `bd_sitbt.dump` | Base de datos completa en formato comprimido (`pg_dump -Fc`). **Recomendado para restaurar.** |
| `bd_sitbt.sql.gz` | La misma base en SQL plano (legible/editable). |
| `roles_globales.sql` | Roles y privilegios globales de PostgreSQL. |
| `minio_archivos.tar.gz` | Copia **física** del volumen de MinIO (restauración exacta). |
| `archivos_minio/` | Los mismos archivos **legibles** (PNG, PDF, etc.) con su ruta original. |
| `SHA256SUMS.txt` | Checksums para verificar que los archivos no estén corruptos. |

## 0. Verificar integridad

```bash
cd backups/completo_AAAAAMMDD_HHMMSS
sha256sum -c SHA256SUMS.txt
```

## 1. Restaurar la base de datos (la forma recomendada)

```bash
cd /home/armintec/Proyectos2026/SITBT
D=backups/completo_AAAAAMMDD_HHMMSS

# (Recomendado) respaldar la BD actual antes de sobrescribir
./backups/backup_bd.sh

# Recrear la base desde cero
docker exec sitbt_postgres psql -U sitbt -d postgres -c "DROP DATABASE IF EXISTS sitbt_db;"
docker exec sitbt_postgres psql -U sitbt -d postgres -c "CREATE DATABASE sitbt_db OWNER sitbt;"

# Restaurar
docker exec -i sitbt_postgres pg_restore -U sitbt -d sitbt_db --no-owner --no-privileges < "$D/bd_sitbt.dump"

# Roles globales (solo en una instalación nueva / si faltan roles)
docker exec -i sitbt_postgres psql -U sitbt -d postgres < "$D/roles_globales.sql"
```

## 2. Restaurar los archivos de MinIO

### Opción A (recomendada): archivos legibles

Requiere que MinIO esté levantado (`docker compose up -d minio`) y el backend instalado.

```bash
D=backups/completo_AAAAAMMDD_HHMMSS
node backups/restaurar_minio.js "$PWD/$D/archivos_minio"
```

También sirve para subir solo algunos archivos: apunta el script a una subcarpeta.

### Opción B: copia física exacta del volumen

Restaura el volumen completo tal como estaba (reemplaza todo el contenido):

```bash
D=backups/completo_AAAAAMMDD_HHMMSS
docker compose stop minio
docker run --rm -v sitbt_minio_data:/data -v "$PWD/$D:/backup:ro" alpine:latest \
  sh -c "rm -rf /data/* && tar xzf /backup/minio_archivos.tar.gz -C /data"
docker compose start minio
```

> ⚠️ La Opción B borra lo que haya actualmente en MinIO. La Opción A solo agrega/sobrescribe los archivos del backup.

## 3. Reiniciar la aplicación

```bash
docker restart sitbt_backend
```

## 4. Verificar

```bash
# Debe mostrar 39
docker exec sitbt_postgres psql -U sitbt -d sitbt_db -t -c \
  "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';"

# Datos de ejemplo
docker exec sitbt_postgres psql -U sitbt -d sitbt_db -c \
  "SELECT (SELECT count(*) FROM estudiantes) AS estudiantes,
          (SELECT count(*) FROM personas) AS personas,
          (SELECT count(*) FROM usuarios) AS usuarios;"
```

Luego abrir http://localhost y probar el login. También revisar que los logos/archivos se vean bien.

## Restauración en otra máquina

1. Copiar la carpeta `completo_.../` a la nueva máquina.
2. Levantar los servicios: `docker compose up -d postgres minio`.
3. Ejecutar los pasos 1 a 3.

> Nota: si el usuario/clave de PostgreSQL cambia, ajustar `-U` y el nombre de la BD en los comandos.
> Para MinIO en otra máquina, ajustar `MINIO_ENDPOINT/PORT/ACCESS_KEY/SECRET_KEY/BUCKET` como variables de entorno al ejecutar los scripts `.js`.

## Después de restaurar: roles y permisos

Los endpoints privados ahora exigen un rol permitido, además del token.
Si después de restaurar algún usuario recibe `403 No tienes permisos para
realizar esta acción`, revisar su rol en la tabla `usuario_roles`.

La matriz de roles por módulo está documentada en
[`docs/seguridad-roles.md`](../docs/seguridad-roles.md).

Para un sistema vacío con solo el administrador:

```bash
npm --prefix backend run semilla:admin
# Usuario: admin / Contraseña: admin123
```
