# Interfaz del estudiante

El estudiante tiene una interfaz propia, separada del panel administrativo.
Entra automáticamente al iniciar sesión y **solo ve sus materias y sus notas**.
Es una interfaz de **solo lectura**: el estudiante no puede modificar notas ni
inscripciones.

## Rutas

| Ruta | Contenido |
| --- | --- |
| `/estudiante` | Mi Panel: materias en curso, notas registradas y promedio general |
| `/estudiante/materias` | Listado de sus materias con buscador |
| `/estudiante/materias/:id` | Detalle de la materia y sus propias notas |
| `/estudiante/perfil` | Datos personales y de la cuenta del estudiante |

El menú lateral del estudiante solo muestra **Mi Panel** y **Mis Materias**. En
el menú del usuario (arriba a la derecha) están **Mi perfil** y **Cerrar
sesión**; no se muestran **Apariencia** ni **Configuración**.

Junto a la campana de notificaciones está el mismo botón de tema que en el
resto del sistema (sol dorado / media luna oscura) para alternar entre modo
claro y oscuro.

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
```

Antes de responder, cada endpoint verifica que exista una inscripción del
estudiante autenticado a esa materia impartida y que no esté retirada. Si no
la tiene, responde `403`. Así, aunque se cambie el `:id` en la URL, no se puede
ver una materia ni una nota ajena.

La respuesta de las notas es una vista curada: solo incluye los campos
académicos (parciales, promedio, segundo turno, definitiva, observación y
estado), sin datos internos de auditoría ni información de otros estudiantes.

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
- El estudiante solo ve materias en estado **cursando**; las retiradas no se
  muestran.
- **Asistencias** no forma parte de esta interfaz.
