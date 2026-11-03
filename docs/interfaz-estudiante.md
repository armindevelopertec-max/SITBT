# Interfaz del estudiante

El estudiante tiene una interfaz propia, separada del panel administrativo.
Entra automáticamente al iniciar sesión y **solo ve sus materias, su malla
curricular y sus notas**. Es una interfaz de **solo lectura**: el estudiante no
puede modificar notas ni inscripciones.

## Rutas

| Ruta | Contenido |
| --- | --- |
| `/estudiante` | Mi Panel: materias en curso, notas registradas y promedio general |
| `/estudiante/materias` | Listado de sus materias con buscador |
| `/estudiante/materias/:id` | Detalle de la materia y sus propias notas |
| `/estudiante/malla` | Malla curricular del plan de estudio con el que ingresó |
| `/estudiante/perfil` | Datos personales y de la cuenta del estudiante |

El menú lateral del estudiante muestra **Mi Panel**, **Mis Materias** y **Mi
Malla Curricular**. En el menú del usuario (arriba a la derecha) están **Mi
perfil** y **Cerrar sesión**; no se muestra **Configuración**.

En el encabezado está el mismo selector de tema que en el resto del sistema,
con las opciones **Claro**, **Oscuro** y **Sistema**. La preferencia se guarda
en el equipo y el color principal es siempre cian.

El avatar del usuario es el mismo componente en el encabezado y en el pie de la
barra lateral: círculo de 32 px con fondo cian translúcido.

En el encabezado y en la barra lateral se muestra el **primer nombre** de la
persona (por ejemplo, `WENCESLAO`), no el nombre de usuario.

## Acceso

- Un usuario con rol `estudiante` y **sin roles internos** (`administrador`,
  `secretaria`, `director_academico`, `rector`, `docente`, `apoyo`) va a
  `/estudiante` al iniciar sesión.
- Si intenta abrir una ruta del panel administrativo o `/docente`, se le
  redirige a `/estudiante`.
- El personal y el administrador siguen usando `/panel` sin cambios. El
  administrador no puede consultar las notas de un estudiante por esta vía.

## Seguridad

El backend resuelve al estudiante **desde el token**, nunca desde un parámetro
del cliente. El registro de estudiante se enlaza por la persona del usuario
autenticado. Los endpoints son:

```
GET /api/estudiante/resumen
GET /api/estudiante/materias
GET /api/estudiante/materias/:id
GET /api/estudiante/malla
```

Antes de responder, cada endpoint verifica que exista una inscripción del
estudiante autenticado a esa materia impartida y que no esté retirada. Si no
la tiene, responde `403`. Así, aunque se cambie el `:id` en la URL, no se puede
ver una materia ni una nota ajena.

La respuesta de las notas es una vista curada: solo incluye los campos
académicos (parciales, promedio, segundo turno, definitiva, observación y
estado), sin datos internos de auditoría ni información de otros estudiantes.

La malla curricular se arma con el `plan_estudio_id` del propio estudiante, no
con el plan vigente de la carrera. Así un estudiante que ingresó con un plan
histórico sigue viendo su malla correcta. Cada materia se cruza con sus
inscripciones para mostrar si está aprobada, cursando, reprobada o pendiente,
además de su nota definitiva y gestión cuando existen.

## Permisos

El módulo `portal_estudiante` se administra desde `/roles`:

- `portal_estudiante:leer` → panel, materias y notas

El rol `estudiante` solo necesita ese permiso. Los permisos amplios que tenía
antes (`estudiantes:leer`, `inscripciones:leer`, `materias_impartidas:leer`,
`pagos:leer`, `certificados:leer`) fueron retirados porque permitían consultar
datos de todo el sistema. Si una pantalla de estudiante necesita un módulo
nuevo, se agrega explícitamente desde `/roles`.

## Relación con otros módulos

- Las notas que ve el estudiante son las mismas del libro de calificaciones que
  registra el docente: promedio, observación, segundo turno y nota definitiva
  se calculan igual que en el módulo administrativo.
- En **Mis Materias** solo ve materias en estado **cursando**; las retiradas no
  se muestran. En **Mi Malla Curricular** ve todas las materias del plan, con su
  estado de avance.
- **Asistencias** no forma parte de esta interfaz.
