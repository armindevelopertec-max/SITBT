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

## El cargo del personal ES un rol
Para que no existieran dos catálogos desincronizados (los cargos del formulario y los roles
de `/roles`), el **cargo del personal es el `codigo` de un rol activo**:

- `personal.cargo` guarda el código del rol (`varchar`, no un enum cerrado).
- El formulario de **Nuevo Personal** y **Editar Personal** arma el selector de cargo con
  `GET /api/personal/cargos`, que devuelve los roles activos que pueden ser cargo.
- Al crear personal, el backend valida que el cargo sea un rol activo existente; si no,
  responde `400` con el mensaje: *"El cargo "X" no corresponde a ningún rol activo. Crea el
  rol desde /roles y vuelve a intentarlo."*
- El rol del cargo se **asigna automáticamente** al usuario creado (`doc_<CI>`).
- Al **editar** el cargo, el rol anterior se retira del usuario y se asigna el nuevo.
- Al **eliminar** un rol, se bloquea con `409` si hay personal que lo usa como cargo, porque
  el cargo es su identidad de rol.

Se excluyen del selector los roles del sistema que no son cargos de personal:
`administrador` y `estudiante`. Todos los demás roles que crees en `/roles` aparecen
automáticamente como opciones de cargo.

> Antes de este cambio el formulario tenía una lista fija de cargos
> (`docente`, `secretaria`, `director_academico`, `rector`, `apoyo`, `bibliotecario`) y el
> backend traducía el cargo a un rol con un mapa hardcodeado. Si el rol no existía, el
> usuario se creaba sin ningún rol y sin avisar. Ese problema ya no existe.

## Convalidación entre planes y prerrequisitos

En **Configuración → Convalidaciones**, cada fila compara una materia del plan de origen
con una del plan de destino. El backend y la interfaz aplican estas reglas:

| Regla | Comportamiento |
|---|---|
| La materia de origen debe ser del plan de origen | Si no, `400` |
| La materia de destino debe ser del plan de destino | Si no, `400` |
| La materia de destino debe ser del **mismo semestre** que la de origen | Si no, `400` con el detalle de ambos semestres |
| El selector solo ofrece materias del plan destino **del semestre de la fila** | Filtro por semestre en la interfaz |

Por eso, en una fila del semestre 1 el desplegable muestra únicamente las materias del
semestre 1 del plan de destino, no las de todos los semestres.

Al **editar las materias de un plan** (`/planes-estudio/:id/materias`) los prerrequisitos
también están acotados:

- El selector de prerrequisito ofrece solo materias **del mismo plan** y de semestres
  anteriores o iguales al que se está editando.
- El backend valida lo mismo y responde `400` si el prerrequisito es de otro plan o de un
  semestre posterior.

## Grupos creados automáticamente en la preinscripción

En **Preinscripción**, cuando el estudiante llega al paso **Asignar grupo** y no existen
grupos para el semestre que va a cursar, el backend los crea solo:

- Un grupo por cada **turno** activo, con **paralelo A**, capacidad 30.
- El grupo hereda el **plan de estudio del estudiante** y el **período abierto** de la
  gestión en curso.
- El código se genera con el mismo criterio que la creación manual
  (ejemplo: `AU-2026-II-01-M-A`).
- Es **idempotente**: si el grupo ya existe no se duplica.

Esto evita que la secretaria tenga que crear los grupos a mano antes de poder matricular.
Si no hay turnos registrados, no se puede crear ningún grupo: ejecuta antes
`npm run semilla:turnos`.

## Reglas de inscripción en la preinscripción

En **Preinscripción** se aplican estas reglas, validadas por el backend:

| Regla | Comportamiento |
|---|---|
| **Una materia, una vez por gestión** | Si la materia ya está inscrita en la gestión (en cualquier grupo), el backend responde `400` y no la vuelve a inscribir. |
| **Un turno por semestre** | El estudiante no puede llevar dos grupos del mismo turno en el mismo semestre: sus materias se imparten a la misma hora y se chocarían. |
| **Turnos distintos en paralelo** | Sí se puede llevar la misma materia en turnos distintos (por ejemplo, cursar una materia en la mañana y otra en la tarde). |
| **Grupos creados automáticamente** | Si no existen grupos para el semestre, se crean: uno por turno, paralelo A, con el plan del estudiante y el período abierto. |
| **Aviso de inscripción previa** | Al buscar al estudiante se consulta si ya está inscrito y se muestra en la lista, sin necesidad de recorrer el proceso. |

Los grupos que ya tienen al estudiante se devuelven con su `turnoId`, de modo que la
interfaz deshabilita los grupos del mismo turno y semestre con la indicación
*"Ya inscrito en este turno"*.

### Roster de grupos e inscripciones

El roster del grupo (`grupos_estudiantes`) y las inscripciones (`inscripciones`) se
mantienen siempre sincronizados:

- La matriculación en el grupo se hace **dentro de la misma transacción** que registra
  las inscripciones. Si la inscripción falla, el estudiante no queda en el grupo.
- Al listar los grupos se **limpian las asignaciones huérfanas**: si un estudiante figura
  en el roster de un grupo pero no tiene ninguna materia inscrita en él, se elimina del
  roster. Así el contador de "Inscritos" refleja siempre a quien cursa de verdad.

### Materias impartidas automáticas

Las **materias impartidas** de un grupo (la malla que se dicta en ese grupo) se generan
**automáticamente** al crear el grupo, con su libro de calificaciones:

| Acción | Resultado |
|---|---|
| Crear un grupo (`POST /grupos`) | Se crean sus materias impartidas y sus libros de notas |
| Generar grupos (`POST /grupos/generar`) | Igual, para todos los grupos del período |
| Clonar grupos (`POST /grupos/clonar`) | Igual, para los grupos clonados |
| Preinscripción que crea grupos | Igual, de forma automática |

Las materias impartidas se toman del **plan de estudio y el semestre del grupo**, una por
cada materia de la malla. Es idempotente: si ya existen, no se duplican.

Por eso ya no hace falta el botón *"Generar materias impartidas"*: la malla de cada grupo
existe desde el momento en que se crea el grupo, y el estudiante preinscrito aparece de
inmediato en los libros de notas.

### Pagos automáticos al confirmar la inscripción

Al confirmar una preinscripción, los **pagos pendientes del período** se registran
automáticamente:

- Se registran los conceptos que falten según `POST /preinscripcion/verificar-pagos`
  (matrícula única y matrícula semestral), con el usuario que confirma la inscripción.
- El estudiante queda con sus pagos al día y aparece en la pantalla de Pagos.
- Si ya estaba pagado, no se registra nada (no hay duplicados).

El frontend envía `recibidoPor` con el usuario que confirma. Si no se envía, los pagos no se
registran y deben cargarse aparte desde la pantalla de Pagos.

Además, las materias se calculan **aunque el estudiante tenga pagos pendientes**: así el
proceso puede completarse y los pagos quedan regularizados al confirmar.

### Listado de inscritos del período

En el paso **Seleccionar estudiante** se listan los estudiantes ya inscritos en el período
actual (`GET /preinscripcion/inscritos`), con búsqueda y paginación. Cada uno muestra su
carrera, cuántas materias tiene y en qué grupos está.

Al seleccionar uno de la lista se muestra su detalle y **no se permite volver a
preinscribirlo** en el mismo período.

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
