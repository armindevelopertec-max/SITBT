# Seguridad por roles y permisos

## Qué se corrigió

1. **Registro de usuarios cerrado.** `POST /api/autenticacion/registrar` dejó de ser público:
   ahora exige token y el rol `administrador`.
2. **Autorización por permisos.** Los endpoints protegidos ya no dependen de una lista fija
   de códigos de rol. Cada rol recibe permisos por **módulo** y **acción** desde la interfaz,
   y el backend los verifica en cada petición.

> El guard `GuardaRoles` conserva el nombre por compatibilidad, pero su lógica actual es de
> permisos. Debe ejecutarse **después** de `GuardaJwt` porque necesita `request.user`:
>
> ```ts
> @UseGuards(GuardaJwt, GuardaRoles)
> ```

## Cómo funciona

1. `EstrategiaJwt.validate()` carga el usuario con `usuarioRoles.rol`, descarta los roles
   inactivos y devuelve:
   ```ts
   {
     id,
     nombreUsuario,
     personaId,
     roles: ['administrador', ...],
     permisos: ['estudiantes:leer', 'pagos:actualizar', ...]
   }
   ```
2. `GuardaRoles` obtiene el módulo desde la primera parte de la ruta y la acción desde el
   método HTTP:
   | Método | Acción |
   |---|---|
   | `GET` | `leer` |
   | `POST` | `crear` |
   | `PATCH` / `PUT` | `actualizar` |
   | `DELETE` | `eliminar` |

   Un `POST` sobre un recurso concreto (por ejemplo `/admision/5/verificar`) se trata como
   `actualizar`.
3. Si el usuario es `administrador`, accede a todo. En caso contrario se exige el permiso
   `modulo:accion`. Si no lo tiene, la API responde `403` con el permiso faltante.

## Origen de los permisos

La tabla `permissions` ya existía y ahora se usa:

| Columna | Uso |
|---|---|
| `rol_id` | Rol al que pertenece el permiso. |
| `module` | Clave del módulo: `estudiantes`, `pagos`, `materias_impartidas`, etc. |
| `accion` | `leer`, `crear`, `actualizar` o `eliminar`. |
| `estado` | Solo los permisos `activo` se aplican. |

Los permisos de todos los roles activos del usuario se suman. Un rol inactivo no aporta
permisos ni códigos al token.

## Catálogo de módulos

El catálogo vive en `backend/src/modulos/permisos/catalogo-permisos.ts` y se expone en
`GET /api/permisos/catalogo` (solo administrador). Incluye, entre otros:

- Admisiones y estudiantes: `admision`, `preinscripcion`, `estudiantes`, `personas`,
  `inscripciones`, `pagos`, `gestiones`, `carreras`.
- Gestión académica: `materias`, `planes_estudio`, `materias_impartidas`, `grupos`,
  `convalidaciones`.
- Personal: `personal`, `asistencias`.
- Documentación y reportes: `certificados`, `documentos`, `credenciales`, `reportes`,
  `notificaciones`, `consentimiento`.
- Sistema: `almacenamiento`.

Cada módulo declara las acciones que admite. Por ejemplo, `reportes` solo admite `leer` y
`almacenamiento` admite `leer`, `crear` y `eliminar`.

## Módulos exclusivos del administrador

Para evitar escaladas de privilegios, estos prefijos siguen siendo solo para
`administrador`, sin importar los permisos asignados:

- `usuarios`
- `roles`
- `permisos`
- `auditoria`
- Escrituras de `configuracion-institucional`
- `POST /api/autenticacion/registrar`

El rol `administrador` no se puede eliminar ni desactivar, y no se puede quitar del último
administrador activo.

## Asignación desde la interfaz

En **Administración del Sistema → Roles**:

1. Crea el rol con cualquier código; el código es solo un identificador.
2. Pulsa el botón **Permisos** del rol.
3. Marca las acciones por módulo en la matriz y guarda.

El menú lateral se arma con el permiso `modulo:leer`. El rol `administrador` ve todo el menú
sin necesidad de permisos.

Los permisos se guardan con `PUT /api/permisos/rol/:rolId` y se consultan con
`GET /api/permisos/rol/:rolId` y `GET /api/permisos/catalogo`. El backend reemplaza la lista
completa del rol en una transacción y valida que cada módulo y acción existan en el catálogo.

En **Usuarios** puedes asignar o quitar roles con el botón de roles de cada fila. Los
permisos efectivos del usuario son la unión de los permisos de sus roles activos.

## Endpoints que se mantienen públicos

Estos endpoints se usan desde el sitio público y se dejaron sin token a propósito:

- `POST /api/admision` (formulario de pre-registro).
- `GET /api/carreras` y `GET /api/planes-estudio/publico` (catálogos del sitio).
- `GET /api/configuracion-institucional/publico` (datos de la institución).
- `GET /api/gestiones` (gestión vigente para el formulario público).
- `GET /api/certificados/verificar/:codigo` (verificación por QR).
- `GET /api/almacenamiento/archivos/*` (archivos públicos, por ejemplo logos).
- `POST /api/autenticacion/iniciar-sesion`.

## Cómo probar

```bash
# 1. Obtener token de administrador
TOKEN=$(curl -s -X POST http://localhost:4000/api/autenticacion/iniciar-sesion \
  -H 'Content-Type: application/json' \
  -d '{"nombreUsuario":"admin","contrasena":"admin123"}' | jq -r .tokenAcceso)

# 2. Catálogo de permisos
curl -s http://localhost:4000/api/permisos/catalogo \
  -H "Authorization: Bearer $TOKEN" | jq

# 3. Crear un rol de prueba y asignarle lectura de estudiantes
ROL=$(curl -s -X POST http://localhost:4000/api/roles \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"codigo":"prueba","nombre":"Prueba"}' | jq -r .id)

curl -s -X PUT http://localhost:4000/api/permisos/rol/$ROL \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"permisos":[{"modulo":"estudiantes","accion":"leer"}]}' | jq

# 4. Con un usuario de ese rol:
#    GET /api/estudiantes -> 200
#    GET /api/personal    -> 403 (falta personal:leer)
#    GET /api/roles       -> 403 (exclusivo del administrador)
```

## Pendientes de seguridad (fuera de este cambio)

- `JWT_SECRET` con valor por defecto en el código.
- PostgreSQL, Redis y MinIO publicados en `0.0.0.0` con credenciales por defecto.
- `GET /api/almacenamiento/archivos/*` público con nombres predecibles.
- `POST /api/asistencias/marcar` sin autenticación (posible lector biométrico).
- Falta limitación de intentos de inicio de sesión (rate limit).
- `synchronize: true` en TypeORM; en producción debe usarse migraciones.
