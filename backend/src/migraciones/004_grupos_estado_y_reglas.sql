-- Migración 004: estado de grupos, reglas de unicidad e historial
-- Idempotente: puede ejecutarse varias veces sin errores.
-- Los nombres de restricción coinciden con los decoradores @Unique de TypeORM.

-- 1. Columna de estado del grupo
ALTER TABLE grupos ADD COLUMN IF NOT EXISTS estado varchar(20) NOT NULL DEFAULT 'activo';

-- 2. Combinación única (gestión, carrera, semestre, turno, paralelo)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE lower(conname) = 'uq_grupo_combinacion'
  ) THEN
    ALTER TABLE grupos
      ADD CONSTRAINT UQ_grupo_combinacion
      UNIQUE (gestion, carrera_id, semestre, turno_id, paralelo);
  END IF;
END $$;

-- 3. Unicidad de estudiante por grupo
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE lower(conname) = 'uq_grupo_estudiante'
  ) THEN
    ALTER TABLE grupos_estudiantes
      ADD CONSTRAINT UQ_grupo_estudiante
      UNIQUE (grupo_id, "estudianteId");
  END IF;
END $$;

-- 4. Tabla de historial (no se borra historial; se conserva la trazabilidad)
CREATE TABLE IF NOT EXISTS grupos_historial (
  id SERIAL PRIMARY KEY,
  grupo_id INTEGER NOT NULL REFERENCES grupos(id),
  estudiante_id INTEGER REFERENCES estudiantes(id),
  accion VARCHAR(30) NOT NULL,
  detalle VARCHAR(255),
  creado_en TIMESTAMP NOT NULL DEFAULT now()
);
