# Interfaz del docente

El docente tiene una interfaz propia, separada del panel administrativo.
Entra automáticamente al iniciar sesión y **solo ve las materias que dicta**.

## Rutas

| Ruta | Contenido |
| --- | --- |
| `/docente` | Mi Panel: resumen de materias, estudiantes, grupos y carga horaria |
| `/docente/materias` | Listado de sus materias con buscador |
| `/docente/materias/:id` | Detalle: pestañas **Estudiantes** y **Calificaciones** |
| `/docente/perfil` | Datos personales y de la cuenta del docente |
| `/docente/apariencia` | Apariencia: solo modo **claro** u **oscuro** |

El menú lateral del docente solo muestra **Mi Panel** y **Mis Materias**. En el
menú del usuario (arriba a la derecha) están **Mi perfil**, **Apariencia** y
**Cerrar sesión**; no se muestra **Configuración**.

Junto a la campana de notificaciones hay un botón con ícono de sol/luna para
alternar entre modo claro y oscuro sin entrar a una pantalla de configuración.
La preferencia se guarda en el equipo.

## Acceso

- Un usuario con rol `docente` (y sin rol `administrador`) va a `/docente`
  al iniciar sesión.
- Si intenta abrir una ruta del panel administrativo, se le redirige a
  `/docente`.
- El resto de los roles sigue usando `/panel` sin cambios.

## Seguridad

El backend resuelve al docente **desde el token**, nunca desde un parámetro
del cliente. Los endpoints son:

```
GET  /api/docente/resumen
GET  /api/docente/materias
GET  /api/docente/materias/:id
GET  /api/docente/materias/:id/estudiantes
GET  /api/docente/materias/:id/libro
POST /api/docente/materias/:id/calificaciones
```

Antes de responder, cada endpoint verifica que exista una asignación activa
del docente autenticado a esa materia impartida. Si no la tiene, responde
`403`. Así, aunque se cambie el `:id` en la URL, no se puede ver ni calificar
una materia ajena.

## Permisos

El módulo `docente` se administra desde `/roles` como cualquier otro:

- `docente:leer` → panel y consultas
- `docente:crear` → registrar calificaciones

El rol `docente` los necesita para usar su interfaz. El administrador conserva
acceso total.

## Relación con otros módulos

- **Asistencias** (`/asistencias`) sigue siendo exclusivo del personal; no
  forma parte de la interfaz del docente.
- Las notas registradas aquí son las mismas del libro de calificaciones:
  promedio, observación y nota definitiva se calculan igual que en el módulo
  administrativo.
