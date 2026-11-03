# Interfaz pública

El sitio institucional (inicio, carreras, admisión, instituto, contacto, legal
y acceso) comparte el sistema de tema del panel interno.

## Rutas

| Ruta | Contenido |
| --- | --- |
| `/` | Inicio: carrusel, valores, carreras, metodología y ubicación |
| `/carreras` | Catálogo de carreras |
| `/carreras/:id` | Detalle de una carrera y su plan de estudio |
| `/admision` | Proceso de admisión, requisitos y costos |
| `/admision/pre-registro` | Formulario de pre-registro |
| `/instituto` | Historia y datos de la institución |
| `/contacto` | Datos de contacto y ubicación |
| `/legal/politica-privacidad` | Política de privacidad |
| `/acceder` | Inicio de sesión |

## Tema

- El encabezado del sitio tiene el selector con **Claro**, **Oscuro** y
  **Sistema**, al igual que el panel interno.
- En pantallas pequeñas el selector aparece junto al botón de menú, porque la
  navegación completa se oculta por debajo de `lg`.
- La preferencia se guarda en el equipo bajo la clave `sitbt-tema` y la comparte
  con el panel interno, el portal del docente y el del estudiante.
- El color principal del sistema es siempre **cian**.

## Colores

Las páginas públicas se construyen con las variables del tema
(`bg-background`, `bg-card`, `bg-muted`, `text-foreground`,
`text-muted-foreground`, `border-border`), por lo que respetan el modo claro y
el modo oscuro. Antes se usaba una paleta oscura fija (`dark-800`, `dark-700`,
`text-gray-300`), que se eliminó.

## Componentes compartidos

- `SelectorTema`: selector Claro / Oscuro / Sistema, con variante `panel` y
  variante `publico`.
- `AvatarUsuario`: avatar genérico del usuario, idéntico en el encabezado y en
  el pie de las barras laterales.

## Logo

- El logo de la institución se muestra a 36 px en el encabezado público y a
  32 px en el pie de la página y en las barras laterales del sistema.
- La imagen se recorta con `object-contain` para que no se deforme.
