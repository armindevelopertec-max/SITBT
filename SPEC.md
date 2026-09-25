# SPEC.md - Sistema Académico Instituto Tecnológico "Boliviana de Tecnología"

## 1. Concepto y Visión

Sistema web multiusuario para gestión académica integral del Instituto Tecnológico "Boliviana de Tecnología". Automatiza la gestión de personas, estudiantes, docentes, inscripciones, calificaciones, kardex, credenciales, convalidaciones y pagos. Diseñado para soportar cambios de R.M. sin romper el historial de estudiantes antiguos.

## 2. Stack Tecnológico

### Backend
- **Framework:** NestJS (Node.js)
- **ORM:** TypeORM
- **Base de datos:** PostgreSQL 16
- **Cache:** Redis
- **Almacenamiento:** MinIO (S3-compatible)
- **Auth:** JWT con Passport
- **API:** REST + Swagger

### Frontend
- **Framework:** Next.js 14 (App Router)
- **UI:** TailwindCSS + shadcn/ui
- **State:** Zustand
- **Forms:** React Hook Form + Zod
- **HTTP:** Axios

### Infraestructura
- **Contenedores:** Docker + Docker Compose
- **Services:** PostgreSQL, Redis, MinIO

## 3. Modelo de Datos (31 tablas)

### Core Entities
- `persons` - Personas (estudiantes, staff)
- `students` - Datos académicos de estudiantes
- `staff` - Personal del instituto
- `users` - Cuentas de usuario
- `roles` - Roles del sistema
- `user_roles` - Asignación usuario-rol
- `permissions` - Permisos por rol

### Carreras y Académico
- `careers` - Carreras (AUT, MEC)
- `study_plans` - Planes de estudio por R.M.
- `subjects` - Materias
- `plan_subjects` - Materias por plan
- `prerequisites` - Prerrequisitos de materias
- `shifts` - Turnos (Mañana, Tarde, Noche)
- `groups` - Grupos por paralelo
- `group_students` - Estudiantes en grupos

### Procesos Académicos
- `enrollments` - Inscripciones a materias
- `grades` - Calificaciones
- `grade_audit` - Auditoría de notas
- `teaching_assignments` - Asignación docente

### Documentos y Certificados
- `certificates` - Certificados emitidos
- `credentials` - Credenciales emitidas
- `student_documents` - Documentos entregados
- `student_guardians` - Datos familiares
- `student_references` - Contactos de referencia

### Pagos
- `payment_concepts` - Conceptos de pago
- `payments` - Pagos realizados
- `student_payment_status` - Estado de pagos

### Convalidaciones
- `equivalences` - Equivalencias entre materias
- `student_convalidations` - Convalidaciones de estudiantes

### Sistema
- `audit_log` - Log de auditoría

## 4. Roles del Sistema

| Rol | Código | Acceso |
|-----|--------|--------|
| Administrador | `administrador` | Todo el sistema |
| Secretaría | `secretaria` | Personas, estudiantes, inscripción, kardex, certificados, pagos |
| Director Académico | `director_academico` | Planes, grupos, docentes, reportes, convalidaciones |
| Rector | `rector` | Reportes globales, estadísticas |
| Docente | `docente` | Calificaciones de sus materias |
| Estudiante | `estudiante` | Ver notas, kardex, horario, pagos |
| Apoyo | `apoyo` | Acceso limitado |

## 5. Reglas de Negocio

### Inscripción
- 0 reprobadas → Todas las materias del siguiente semestre
- 1-2 reprobadas → Reprobadas + siguientes con prerrequisitos aprobados
- 3+ reprobadas → Solo materias reprobadas
- Dispersión: `semestre_actual − semestre_arrastre ≤ 2`
- Recuperación: Máx. 2 materias, accede con ≥40, aprueba con ≥61

### Calificaciones
- 1er parcial: 0-100
- 2do parcial: 0-100
- Promedio: REDONDEAR(PROMEDIO(p1, p2), 0)
- Acceso 2T: 40 ≤ promedio ≤ 60
- Nota 2T: 0-61
- Definitiva: MAX(promedio, nota_2T)
- Aprobación: definitiva > 60

### Pagos (solo 2 conceptos)
- Formulario de Registro: único, estudiantes nuevos
- Credencial: semestral, todos los estudiantes

## 6. Módulos (17)

1. Gestión de Personas
2. Gestión de Estudiantes
3. Gestión de Staff
4. Gestión de Usuarios y Roles
5. Gestión de Carreras y Planes de Estudio
6. Gestión de Turnos, Paralelos y Grupos
7. Inscripción
8. Calificaciones
9. Kardex e Historial Académico
10. Gestión de Docentes y Asignación de Materias
11. Certificados y Documentos
12. Reportes y Estadísticas
13. Convalidaciones
14. Gestión de Pagos
15. Seguridad y Auditoría
16. Datos Familiares y de Referencia
17. Documentos del Estudiante

## 7. Estructura del Proyecto

```
/home/armintec/Proyectos2026/SITBT/
├── backend/                 # NestJS API
├── frontend/               # Next.js App
├── docker-compose.yml      # PostgreSQL, Redis, MinIO
└── SPEC.md
```

## 8. API Endpoints Principales

### Auth
- POST /auth/login
- POST /auth/register
- GET /auth/profile

### Persons
- GET/POST /persons
- GET/PUT/DELETE /persons/:id

### Students
- GET/POST /students
- GET/PUT/DELETE /students/:id
- GET /students/:id/kardex

### Enrollments
- POST /enrollments
- GET /enrollments/student/:studentId

### Grades
- GET /grades/enrollment/:enrollmentId
- PUT /grades/:id
- POST /grades/:id/second-turn

### Careers
- GET/POST /careers
- GET /careers/:id/plans

### Payments
- GET/POST /payments
- GET /payments/student/:studentId/status
