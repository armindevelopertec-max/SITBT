-- Módulo 7: Materias impartidas, docentes y libro de calificaciones.
-- Las tablas nuevas las crea TypeORM (synchronize). Este archivo documenta el
-- esquema resultante y es idempotente.

-- Materias impartidas: asignatura oficial de la malla ofrecida a un grupo en un periodo.
CREATE TABLE IF NOT EXISTS materias_impartidas (
  id SERIAL PRIMARY KEY,
  grupo_id INTEGER NOT NULL REFERENCES grupos(id),
  materia_id INTEGER NOT NULL REFERENCES materias(id),
  materia_plan_id INTEGER REFERENCES materias_plan(id),
  periodo_id INTEGER NOT NULL REFERENCES periodos(id),
  gestion VARCHAR(10) NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'activa',
  creado_en TIMESTAMP NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "UQ_materia_impartida" UNIQUE (grupo_id, materia_id, periodo_id)
);

-- Inscripción de estudiantes a una materia impartida.
CREATE TABLE IF NOT EXISTS inscripciones_materia (
  id SERIAL PRIMARY KEY,
  estudiante_id INTEGER NOT NULL REFERENCES estudiantes(id),
  materia_impartida_id INTEGER NOT NULL REFERENCES materias_impartidas(id),
  estado VARCHAR(20) NOT NULL DEFAULT 'cursando',
  creado_en TIMESTAMP NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "UQ_inscripcion_materia" UNIQUE (estudiante_id, materia_impartida_id)
);

-- Libro oficial de calificaciones por materia impartida.
CREATE TABLE IF NOT EXISTS libros_calificaciones (
  id SERIAL PRIMARY KEY,
  materia_impartida_id INTEGER NOT NULL UNIQUE REFERENCES materias_impartidas(id),
  estado VARCHAR(30) NOT NULL DEFAULT 'borrador',
  observacion TEXT,
  cerrado_en TIMESTAMP,
  cerrado_por INTEGER,
  creado_en TIMESTAMP NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMP NOT NULL DEFAULT now()
);

-- Historial de cierres y reaperturas.
CREATE TABLE IF NOT EXISTS cierres_academicos (
  id SERIAL PRIMARY KEY,
  libro_id INTEGER NOT NULL REFERENCES libros_calificaciones(id),
  accion VARCHAR(20) NOT NULL,
  motivo TEXT,
  autorizado_por INTEGER,
  creado_en TIMESTAMP NOT NULL DEFAULT now()
);

-- Ampliación de asignaciones docentes con vigencia y carga horaria.
ALTER TABLE asignaciones_docentes ADD COLUMN IF NOT EXISTS materia_impartida_id INTEGER;
ALTER TABLE asignaciones_docentes ADD COLUMN IF NOT EXISTS fecha_inicio DATE;
ALTER TABLE asignaciones_docentes ADD COLUMN IF NOT EXISTS fecha_fin DATE;
ALTER TABLE asignaciones_docentes ADD COLUMN IF NOT EXISTS carga_horaria INTEGER;
ALTER TABLE asignaciones_docentes ADD COLUMN IF NOT EXISTS observacion TEXT;

-- La tabla calificaciones se reutiliza para el módulo (clave inscripcion_materia_id).
-- Columnas de estado por campo, método de promedio y trazabilidad.
ALTER TABLE calificaciones ADD COLUMN IF NOT EXISTS inscripcion_materia_id INTEGER;
ALTER TABLE calificaciones ADD COLUMN IF NOT EXISTS parcial_1_estado VARCHAR(20) NOT NULL DEFAULT 'sin_registrar';
ALTER TABLE calificaciones ADD COLUMN IF NOT EXISTS parcial_2_estado VARCHAR(20) NOT NULL DEFAULT 'sin_registrar';
ALTER TABLE calificaciones ADD COLUMN IF NOT EXISTS promedio_metodo VARCHAR(20) NOT NULL DEFAULT 'calculado';
ALTER TABLE calificaciones ADD COLUMN IF NOT EXISTS estado_revision VARCHAR(25) NOT NULL DEFAULT 'sin_iniciar';
ALTER TABLE calificaciones ADD COLUMN IF NOT EXISTS docente_id INTEGER;
ALTER TABLE calificaciones ADD COLUMN IF NOT EXISTS creado_por_id INTEGER;
ALTER TABLE calificaciones ADD COLUMN IF NOT EXISTS modificado_por_id INTEGER;

-- Auditoría de calificaciones: motivo de la modificación.
ALTER TABLE auditoria_calificacion ADD COLUMN IF NOT EXISTS motivo TEXT;
