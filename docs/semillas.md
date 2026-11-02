# Semillas de datos

Los scripts de semilla están en `backend/src/` y se ejecutan desde `backend/`:

```bash
cd backend
npm run semilla:admin       # rol administrador + usuario admin/admin123
npm run semilla:gestiones   # gestiones académicas y sus periodos
npm run semilla:carreras    # carreras y planes de estudio vigentes
npm run semilla:materias    # materias y materias por plan (del respaldo)
npm run semilla:planes-variantes # variantes de planes con materias propias
npm run semilla:docentes    # los 6 docentes del respaldo
npm run semilla:estudiantes # estudiantes tomados del JSON (5 aleatorios por defecto)
```

Orden recomendado para una base vacía:

```bash
npm run semilla:admin
npm run semilla:gestiones
npm run semilla:conceptos-pago
npm run semilla:turnos
npm run semilla:carreras
npm run semilla:materias
npm run semilla:planes-variantes
npm run semilla:docentes
npm run semilla:estudiantes
```

Todos son **idempotentes**: se pueden reejecutar sin duplicar registros.

## `semilla:admin`

Semilla mínima del sistema:

- Rol `administrador` (activo).
- Persona `CI 0000001` (Administrador Sistema SITBT).
- Usuario `admin` / `admin123`.
- Asignación del rol `administrador` al usuario.

No crea los demás roles ni carga información institucional.

## `semilla:gestiones`

Crea las **gestiones académicas** y sus **periodos**, con los datos del respaldo
`backups/completo_20261101_130109/bd_sitbt.sql.gz` (tablas `gestiones` y `periodos`).

| Gestión | Tipo | Estado | ¿Actual? | Periodo I | Periodo II |
|---|---|---|---|---|---|
| 2026 | semestral | abierta | **sí** | 2026-02-20 → 2026-07-10 (cerrada) | 2026-07-20 → 2026-12-11 (**abierta**) |
| 2027 | semestral | cerrada | no | 2027-02-20 → 2027-07-10 (pendiente) | 2027-07-20 → 2027-12-11 (pendiente) |
| 2028 | semestral | cerrada | no | 2028-02-20 → 2028-07-10 (pendiente) | 2028-07-20 → 2028-12-11 (pendiente) |

Es **necesaria** antes de crear grupos, períodos de pago o inscripciones: todas esas
tablas apuntan a `periodos`, y los grupos a su `periodo_id`.

Solo una gestión puede ser la actual (`es_actual`). La gestión 2026 es la vigente y su
**periodo II** es el que está abierto.

Es **idempotente**: no duplica gestiones ni periodos.

## `semilla:conceptos-pago`

Crea los **conceptos de pago** (matrícula única y matrícula semestral). El respaldo
`backups/completo_20261101_130109/bd_sitbt.sql.gz` traía solo el concepto de Matrícula
(Bs 150, tipo único); se añade además el semestral, necesario para el cobro por período.

| Código | Nombre | Tipo | Monto |
|---|---|---|---|
| `MAT` | Matrícula | `unico` | Bs 150 |
| `SEM` | Matrícula semestral | `semestral` | Bs 150 |

**Es obligatoria antes de usar la preinscripción.** Sin conceptos registrados, la
verificación de pagos no puede detectar lo que falta: `pagosFaltantes` queda vacío y el
sistema informa *"Pagos al día"* aunque el estudiante no haya pagado nada.

Es **idempotente**: no duplica conceptos.

## `semilla:turnos`

Crea los **turnos** de la institución, con los datos del respaldo
`backups/completo_20261101_130109/bd_sitbt.sql.gz` (tabla `turnos`).

| Código | Nombre | Horario |
|---|---|---|
| `MAÑANA` | Turno Mañana | 07:00 → 12:00 |
| `TARDE` | Turno Tarde | 14:00 → 18:00 |
| `NOCHE` | Turno Noche | 19:00 → 22:00 |

Es **necesaria** antes de crear grupos: cada grupo pertenece a un turno. Además, la
preinscripción crea los grupos automáticamente usando estos turnos.

Es **idempotente**: no duplica turnos.

## `semilla:carreras`

Crea las **carreras y los planes de estudio vigentes** que exige el registro de
estudiantes (`estudiantes.carrera_id` y `estudiantes.plan_estudio_id` son obligatorios).

| Carrera | Código | Plan vigente |
|---|---|---|
| Autotrónica | `AU` | `1049/2023` |
| Mecánica Automotriz | `ME` | `0210/2023` |

Es **necesaria antes** de `semilla:materias` y de `semilla:estudiantes`.

## `semilla:materias`

Inserta el **catálogo de materias y su asignación a los planes de estudio**, con los
datos del respaldo `backups/completo_20261101_130109/bd_sitbt.sql.gz`
(tablas `materias` y `materias_plan`).

Los datos están embebidos en `backend/src/datos/materias-backup.ts`:

- **71 materias** con su código y nombre (catálogo general, compartido entre los planes).
- **79 asignaciones** a planes con semestre, horas semanales y prerrequisito:

| Plan | Materias | Con prerrequisito | Semestres | Horas semanales |
|---|---|---|---|---|
| Autotrónica (`1049/2023`) | 39 | 13 | 1 a 6 | 180 |
| Mecánica Automotriz (`0210/2023`) | 40 | 18 | 1 a 6 | 180 |

Los prerrequisitos se resuelven por código de materia (no por id), por lo que el seed
funciona en cualquier base, sin importar los ids que se le asignen.

Requiere las carreras y planes vigentes: ejecuta antes `npm run semilla:carreras`.

Es **idempotente**: no duplica materias ni asignaciones.

## `semilla:planes-variantes`

Crea **variantes de los planes de estudio** con materias propias. Cada variante mantiene
exactamente la misma estructura académica que su plan base (mismas materias por semestre
y las mismas horas semanales), pero con una orientación distinta.

| Plan base | Variante | RM | Enfoque |
|---|---|---|---|
| Autotrónica (`1049/2023`) | Autotrónica Electrónica | `1049/2023-A` | Electrónica, programación, redes y control |
| Autotrónica (`1049/2023`) | Autotrónica Híbridos | `1049/2023-B` | Vehículos eléctricos e híbridos, BMS, alto voltaje |
| Mecánica Automotriz (`0210/2023`) | Mecánica Automotriz Diesel | `0210/2023-A` | Motores diésel, inyección, sobrealimentación |
| Mecánica Automotriz (`0210/2023`) | Mecánica Automotriz Servicio | `0210/2023-B` | Taller, servicio, diagnóstico y herramientas |

Estructura resultante:

| Carrera | Plan | S1 | S2 | S3 | S4 | S5 | S6 | Total | Prerreq. |
|---|---|---|---|---|---|---|---|---|---|
| Autotrónica | 1049/2023 | 6 | 7 | 6 | 6 | 7 | 7 | 39 | 13 |
| Autotrónica | 1049/2023-A | 6 | 7 | 6 | 6 | 7 | 7 | 39 | 13 |
| Autotrónica | 1049/2023-B | 6 | 7 | 6 | 6 | 7 | 7 | 39 | 13 |
| Mecánica Automotriz | 0210/2023 | 7 | 6 | 6 | 6 | 7 | 8 | 40 | 18 |
| Mecánica Automotriz | 0210/2023-A | 7 | 6 | 6 | 6 | 7 | 8 | 40 | 0 |
| Mecánica Automotriz | 0210/2023-B | 7 | 6 | 6 | 6 | 7 | 8 | 40 | 0 |

Los datos están en `backend/src/datos/planes-variantes.ts`:

- **142 materias nuevas** con sufijo de variante en el código (`EMC-100-A`,
  `MOG-100-B`, …) para no chocar con el catálogo del respaldo.
- Las asignaciones a plan con semestre, horas semanales y prerrequisito.

Los prerrequisitos se resuelven por **código de materia**, no por id, así que el seed
funciona en cualquier base.

Requiere las carreras: ejecuta antes `npm run semilla:carreras`.

Es **idempotente**: no duplica planes, materias ni asignaciones. Si una materia o un
prerrequisito no existe, lo avisa en la sección *Advertencias* y omite solo esa fila.

## `semilla:docentes`

Inserta **solo los 6 docentes** que estaban en el respaldo
`backups/completo_20261101_130109/bd_sitbt.sql.gz` (personas 5 a 10 y personal 3 a 8).
No inserta estudiantes ni otras personas.

| CI | Docente | Profesión |
|---|---|---|
| 12391896 | Geobany Israel Condori Mamani | Técnico Superior en Mecánica Automotriz |
| 7073822 | Mauricio Quispe Intimayta | Técnico Superior en Mecánica Automotriz |
| 8302164 | Rolando Huanaco Flores | Técnico Superior en Mecánica Automotriz |
| 12572834 | Wilfredo Quenta Apaza | Técnico Superior en Mecánica Automotriz |
| 6163428 | Willy Quispe Surco | Licenciado en Mecánica Automotriz |
| 7064275 | Yhonny Ivan Condori Mita | Licenciado en Mecánica Automotriz |

Cada docente se registra en `personas` + `personal` y recibe un usuario con el mismo
formato que el alta de personal desde la aplicación:

- Usuario: `doc_<CI>`
- Contraseña: `<CI>-<año actual>` (ejemplo: `doc_12391896` / `12391896-2026`)

El rol `docente` **no se crea aquí**: si ya existe y está activo se asigna a los
docentes; si no, los usuarios quedan sin rol y el administrador los asigna desde
`/usuarios`.

## `semilla:estudiantes`

Toma los datos de `estudiantes_2026.json` (188 registros) e inserta personas,
estudiantes y usuarios con el mismo patrón que `ServicioEstudiantes.crear()`.

Por defecto inserta **5 estudiantes aleatorios**. La cantidad se controla con la
variable de entorno `CANTIDAD_ESTUDIANTES`:

```bash
npm run semilla:estudiantes                         # 5 aleatorios
CANTIDAD_ESTUDIANTES=20 npm run semilla:estudiantes # 20 aleatorios
CANTIDAD_ESTUDIANTES=0 npm run semilla:estudiantes  # todos (188)
```

Detalles:

- La selección es **aleatoria** en cada ejecución (se mezcla el archivo), no toma
  siempre los primeros.
- `CANTIDAD_ESTUDIANTES` es el **total objetivo**, no la cantidad a crear por
  ejecución. Si ya hay 5 estudiantes y el objetivo es 5, no crea nada; si el
  objetivo es 8, crea solo 3.
- Requiere las carreras y planes vigentes: ejecuta antes `npm run semilla:carreras`.
- El código de inscripción sigue el formato `INICIALES-CARRERAaa-XX`
  (ejemplo: `HMW-AU2613`).
- Usuario: `est_<codigo con guiones bajos>` · Contraseña: `<CI>-<gestión>`
  (ejemplo: `est_HMW_AU2613` / `6105713-2026`).
- El rol `estudiante` **no se crea aquí**: se asigna si existe y está activo; si no,
  el administrador lo asigna desde `/usuarios`.

### Datos que el JSON no trae

| Campo | Cómo se resuelve |
|---|---|
| `genero` | Lista explícita de CI femeninas; el resto se asume `M`. |
| `fecha_nacimiento` | Valor provisional `2005-01-01` (la columna no admite nulos). |
| `carrera` / `plan_estudio` | Se buscan por nombre normalizado en las carreras y planes vigentes. |
