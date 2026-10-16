-- ============================================================
--  SITBT - Consultas utiles (PostgreSQL)
-- ------------------------------------------------------------
--  Como usarlo:
--     PGPASSWORD=sitbt_password psql -h localhost -p 5434 -U sitbt -d sitbt_db -f consultas-utiles.sql
--  O interactivo:
--     PGPASSWORD=sitbt_password psql -h localhost -p 5434 -U sitbt -d sitbt_db
--       \dt              lista tablas
--       \d estudiantes   describe una tabla
--       \x auto          resultados en vertical (comodo con muchas columnas)
--       \q               salir
--
--  OJO: varias columnas usan camelCase y por eso van entre comillas dobles
--       ("personaId", "estadoMatricula", "estudianteId", "gestionId", ...)
-- ============================================================


-- ============================================================
-- 1) DIAGNOSTICO RAPIDO
-- ============================================================

-- 1.1 Cuantas filas tiene cada tabla (solo las que tienen datos)
SELECT relname AS tabla, n_live_tup AS filas
FROM pg_stat_user_tables
WHERE n_live_tup > 0
ORDER BY n_live_tup DESC;

-- 1.2 Tamano de la base y de las tablas mas grandes
SELECT pg_size_pretty(pg_database_size(current_database())) AS tamano_base;
SELECT relname AS tabla, pg_size_pretty(pg_total_relation_size(relid)) AS tamano
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC
LIMIT 10;


-- ============================================================
-- 2) ESTUDIANTES (lo mas usado)
-- ============================================================

-- 2.1 Listado completo: estudiante + persona + carrera + plan
SELECT e.id,
       p.ci,
       p.apellido_paterno || ' ' || COALESCE(p.apellido_materno, '') || ', ' || p.nombres AS nombre_completo,
       p.telefono,
       p.correo,
       e.codigo_inscripcion,
       c.nombre  AS carrera,
       pe.numero_rm AS plan,
       e.gestion_admision,
       e.estado,
       e."estadoMatricula" AS estado_matricula
FROM estudiantes e
JOIN personas p        ON p.id  = e."personaId"
LEFT JOIN carreras c        ON c.id  = e.carrera_id
LEFT JOIN planes_estudio pe ON pe.id = e.plan_estudio_id
ORDER BY e.id;

-- 2.2 Buscar un estudiante por CI (cambia el 1234567)
SELECT e.id, p.ci, p.apellido_paterno || ', ' || p.nombres AS estudiante,
       e.codigo_inscripcion, c.nombre AS carrera, e.estado, e."estadoMatricula"
FROM estudiantes e
JOIN personas p ON p.id = e."personaId"
LEFT JOIN carreras c ON c.id = e.carrera_id
WHERE p.ci = '1234567';

-- 2.3 Resumen por estado de matricula
SELECT e."estadoMatricula" AS estado_matricula, count(*) AS total
FROM estudiantes e
GROUP BY 1
ORDER BY 2 DESC;

-- 2.4 Estudiantes por carrera y gestion
SELECT c.nombre AS carrera, e.gestion_admision, count(*) AS total
FROM estudiantes e
LEFT JOIN carreras c ON c.id = e.carrera_id
GROUP BY c.nombre, e.gestion_admision
ORDER BY c.nombre, e.gestion_admision DESC;

-- 2.5 Estudiante con su cuenta de acceso (usuario)
SELECT e.codigo_inscripcion,
       p.ci,
       p.apellido_paterno || ', ' || p.nombres AS estudiante,
       u.nombre_usuario,
       u.estado AS estado_usuario,
       u.ultimo_acceso
FROM estudiantes e
JOIN personas p ON p.id = e."personaId"
LEFT JOIN usuarios u ON u."personaId" = p.id
ORDER BY e.id;


-- ============================================================
-- 3) PRE-REGISTROS / SOLICITUDES DE ADMISION
-- ============================================================

-- 3.1 Solicitudes con su carrera y su estado
SELECT s.id, s.ci,
       s.nombre || ' ' || s.apellido_paterno || ' ' || COALESCE(s.apellido_materno, '') AS postulante,
       s.carrera_id,
       c.nombre AS carrera,
       s.estado,
       s.origen,
       s."converted_estudianteId" AS estudiante_generado,
       s.creado_en
FROM solicitudes_admision s
LEFT JOIN carreras c ON c.id = s.carrera_id
ORDER BY s.creado_en DESC;

-- 3.2 Solicitudes que todavia NO se convirtieron en estudiante
SELECT s.id, s.ci, s.nombre || ' ' || s.apellido_paterno AS postulante,
       c.nombre AS carrera, s.estado, s.creado_en
FROM solicitudes_admision s
LEFT JOIN carreras c ON c.id = s.carrera_id
WHERE s."converted_estudianteId" IS NULL
ORDER BY s.creado_en DESC;

-- 3.3 Enlace solicitud -> estudiante generado
SELECT s.id AS solicitud, s.ci, s.estado AS estado_solicitud,
       e.id AS estudiante_id, e.codigo_inscripcion, c.nombre AS carrera
FROM solicitudes_admision s
LEFT JOIN estudiantes e ON e.solicitud_admision_id = s.id::text
LEFT JOIN carreras c ON c.id = s.carrera_id
ORDER BY s.creado_en DESC;


-- ============================================================
-- 4) USUARIOS Y ROLES
-- ============================================================

-- 4.1 Usuarios con sus roles
SELECT u.id, u.nombre_usuario,
       p.ci,
       p.nombres || ' ' || p.apellido_paterno AS persona,
       u.estado,
       u.ultimo_acceso,
       string_agg(r.codigo, ', ') AS roles
FROM usuarios u
LEFT JOIN personas p      ON p.id = u."personaId"
LEFT JOIN usuario_roles ur ON ur.usuario_id = u.id
LEFT JOIN roles r          ON r.id = ur.rol_id
GROUP BY u.id, u.nombre_usuario, p.ci, p.nombres, p.apellido_paterno, u.estado, u.ultimo_acceso
ORDER BY u.id;

-- 4.2 Cuantos usuarios hay por rol
SELECT r.codigo AS rol, r.nombre, count(ur.usuario_id) AS usuarios
FROM roles r
LEFT JOIN usuario_roles ur ON ur.rol_id = r.id
GROUP BY r.codigo, r.nombre
ORDER BY usuarios DESC;


-- ============================================================
-- 5) PAGOS Y RECAUDACION
-- ============================================================

-- 5.1 Detalle de pagos
SELECT pg.id,
       p.ci,
       p.apellido_paterno || ', ' || p.nombres AS estudiante,
       cp.nombre AS concepto,
       pg.monto,
       pg.metodo_pago,
       pg.estado,
       pg.fecha_pago,
       pg.numero_recibo
FROM pagos pg
JOIN estudiantes e     ON e.id = pg.estudiante_id
JOIN personas p        ON p.id = e."personaId"
LEFT JOIN conceptos_pago cp ON cp.id = pg.concepto_id
ORDER BY pg.fecha_pago DESC;

-- 5.2 Recaudado por gestion (solo pagos vigentes)
SELECT pg.gestion,
       count(*)            AS cantidad_pagos,
       sum(pg.monto)       AS total_recaudado
FROM pagos pg
WHERE pg.estado = 'pagado'
GROUP BY pg.gestion
ORDER BY pg.gestion DESC;

-- 5.3 Recaudado por concepto
SELECT cp.nombre AS concepto,
       count(*)       AS cantidad,
       sum(pg.monto)  AS total
FROM pagos pg
JOIN conceptos_pago cp ON cp.id = pg.concepto_id
WHERE pg.estado = 'pagado'
GROUP BY cp.nombre
ORDER BY total DESC;

-- 5.4 Estudiantes sin ningun pago pagado en la gestion actual (posibles deudores)
WITH gestion_actual AS (
  SELECT anio FROM gestiones WHERE es_actual = true LIMIT 1
)
SELECT e.id, p.ci,
       p.apellido_paterno || ', ' || p.nombres AS estudiante,
       c.nombre AS carrera,
       ga.anio AS gestion
FROM estudiantes e
JOIN personas p ON p.id = e."personaId"
LEFT JOIN carreras c ON c.id = e.carrera_id
CROSS JOIN gestion_actual ga
WHERE NOT EXISTS (
  SELECT 1 FROM pagos pg
  WHERE pg.estudiante_id = e.id
    AND pg.gestion = ga.anio
    AND pg.estado = 'pagado'
)
ORDER BY p.apellido_paterno;


-- ============================================================
-- 6) ACADEMICO: GRUPOS, INSCRIPCIONES Y NOTAS
-- ============================================================

-- 6.1 Grupos con materia, carrera, turno y ocupacion
SELECT g.id, g.codigo,
       c.nombre AS carrera,
       m.nombre AS materia,
       g.gestion, g.semestre, g.paralelo,
       t.nombre AS turno,
       g.capacidad,
       count(ge.id) AS inscritos
FROM grupos g
LEFT JOIN carreras c ON c.id = g.carrera_id
LEFT JOIN materias m ON m.id = g.materia_id
LEFT JOIN turnos t   ON t.id = g.turno_id
LEFT JOIN grupos_estudiantes ge ON ge.grupo_id = g.id
GROUP BY g.id, g.codigo, c.nombre, m.nombre, g.gestion, g.semestre, g.paralelo, t.nombre, g.capacidad
ORDER BY g.gestion DESC, g.codigo;

-- 6.2 Alumnos por grupo
SELECT g.codigo AS grupo, m.nombre AS materia,
       p.ci, p.apellido_paterno || ', ' || p.nombres AS estudiante,
       ge.inscrito_en
FROM grupos_estudiantes ge
JOIN grupos g    ON g.id = ge.grupo_id
LEFT JOIN materias m ON m.id = g.materia_id
JOIN estudiantes e ON e.id = ge."estudianteId"
JOIN personas p    ON p.id = e."personaId"
ORDER BY g.codigo, p.apellido_paterno;

-- 6.3 Inscripciones con notas
SELECT i.id,
       p.ci,
       p.apellido_paterno || ', ' || p.nombres AS estudiante,
       m.nombre AS materia,
       g.codigo AS grupo,
       i.gestion, i.semestre, i.estado, i.nota_final,
       cal.parcial_1, cal.parcial_2, cal.promedio_final,
       cal.nota_definitiva, cal.estado_definitivo
FROM inscripciones i
JOIN estudiantes e ON e.id = i.estudiante_id
JOIN personas p    ON p.id = e."personaId"
LEFT JOIN materias m ON m.id = i.materia_id
LEFT JOIN grupos g   ON g.id = i.grupo_id
LEFT JOIN calificaciones cal ON cal.inscripcion_id = i.id
ORDER BY p.apellido_paterno, m.nombre;

-- 6.4 Promedio general por estudiante
SELECT p.ci, p.apellido_paterno || ', ' || p.nombres AS estudiante,
       count(cal.id)                 AS materias_calificadas,
       round(avg(cal.nota_definitiva), 2) AS promedio_general
FROM calificaciones cal
JOIN inscripciones i ON i.id = cal.inscripcion_id
JOIN estudiantes e   ON e.id = i.estudiante_id
JOIN personas p      ON p.id = e."personaId"
WHERE cal.nota_definitiva IS NOT NULL
GROUP BY p.ci, p.nombres, p.apellido_paterno
ORDER BY promedio_general DESC;

-- 6.5 Materias por plan (malla curricular vigente)
SELECT pe.id AS plan, c.nombre AS carrera, pe.numero_rm,
       mp.semestre, m.codigo, m.nombre AS materia, mp.horas_semanales
FROM materias_plan mp
JOIN planes_estudio pe ON pe.id = mp.plan_estudio_id
JOIN carreras c        ON c.id = pe.carrera_id
JOIN materias m        ON m.id = mp.materia_id
WHERE pe.estado = 'vigente'
ORDER BY c.nombre, mp.semestre, m.codigo;


-- ============================================================
-- 7) GESTIONES Y PERIODOS
-- ============================================================

SELECT g.id AS gestion_id, g.anio, g.tipo_periodo, g.estado, g.es_actual,
       pe.numero AS periodo, pe.nombre AS nombre_periodo,
       pe.fecha_inicio, pe.fecha_fin, pe.estado AS estado_periodo
FROM gestiones g
LEFT JOIN periodos pe ON pe."gestionId" = g.id
ORDER BY g.anio DESC, pe.numero;


-- ============================================================
-- 8) DOCUMENTOS, CERTIFICADOS Y CREDENCIALES
-- ============================================================

-- 8.1 Documentos emitidos
SELECT d.numero_documento, d.tipo,
       p.ci, p.apellido_paterno || ', ' || p.nombres AS estudiante,
       d.gestion, d.estado, d."fechaEmision", d."entregadoA"
FROM documentos_emitidos d
JOIN estudiantes e ON e.id = d.estudiante_id
JOIN personas p    ON p.id = e."personaId"
ORDER BY d."fechaEmision" DESC;

-- 8.2 Certificados emitidos
SELECT ce.codigo, ce.tipo, ce.fecha,
       p.ci, p.apellido_paterno || ', ' || p.nombres AS estudiante
FROM certificados ce
JOIN estudiantes e ON e.id = ce.estudiante_id
JOIN personas p    ON p.id = e."personaId"
ORDER BY ce.fecha DESC;

-- 8.3 Credenciales
SELECT cr.id, p.ci, p.apellido_paterno || ', ' || p.nombres AS estudiante,
       c.nombre AS carrera, cr.gestion, cr.estado, cr."estadoEntrega",
       cr."tipoEmision", cr."fechaEmision", cr."validoHasta"
FROM credenciales cr
JOIN estudiantes e ON e.id = cr.estudiante_id
JOIN personas p    ON p.id = e."personaId"
LEFT JOIN carreras c ON c.id = e.carrera_id
ORDER BY cr.id DESC;


-- ============================================================
-- 9) AUDITORIA
-- ============================================================

-- 9.1 Ultimos movimientos
SELECT ra.fecha, u.nombre_usuario, ra.accion, ra.tabla, ra.registro_id
FROM registro_auditoria ra
LEFT JOIN usuarios u ON u.id = ra.usuario_id
ORDER BY ra.fecha DESC
LIMIT 50;

-- 9.2 Cambios de calificaciones
SELECT ac.cambiado_en, u.nombre_usuario, ac.calificacion_id,
       ac.campo_cambiado, ac.valor_anterior, ac.valor_nuevo
FROM auditoria_calificacion ac
LEFT JOIN usuarios u ON u.id = ac."usuarioId"
ORDER BY ac.cambiado_en DESC;


-- ============================================================
-- 10) EXPLORAR LA ESTRUCTURA (util al programar)
-- ============================================================

-- 10.1 Columnas de una tabla (cambia el nombre de la tabla)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'estudiantes'
ORDER BY ordinal_position;

-- 10.2 Llaves foraneas de una tabla
SELECT DISTINCT
       tc.table_name AS tabla,
       kcu.column_name AS columna,
       ccu.table_name  AS tabla_referenciada,
       ccu.column_name AS columna_referenciada
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
     ON kcu.constraint_name = tc.constraint_name
JOIN information_schema.constraint_column_usage ccu
     ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'estudiantes'
ORDER BY kcu.column_name;

-- 10.3 Tablas con columnas en camelCase (ojo con las comillas al consultarlas)
SELECT table_name,
       string_agg(column_name, ', ' ORDER BY column_name) AS columnas_camel
FROM information_schema.columns
WHERE table_schema = 'public' AND column_name ~ '[A-Z]'
GROUP BY table_name
ORDER BY table_name;

-- 10.4 Valores permitidos de los tipos ENUM (estados, generos, etc.)
SELECT t.typname AS tipo,
       string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) AS valores
FROM pg_type t
JOIN pg_enum e ON e.enumtypid = t.oid
GROUP BY t.typname
ORDER BY t.typname;

-- 10.5 Indices de una tabla
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'estudiantes';


-- ============================================================
-- 11) MANTENIMIENTO / LIMPIEZA (usar con cuidado)
-- ============================================================

-- 11.1 Conexiones activas
SELECT pid, usename, application_name, client_addr, state, query
FROM pg_stat_activity
WHERE datname = current_database()
ORDER BY state;

-- 11.2 Ver el tamano de las filas mas grandes de una tabla
SELECT pg_size_pretty(pg_relation_size('pagos')) AS tamano_pagos;
