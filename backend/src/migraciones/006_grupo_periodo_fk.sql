-- Migración 006: el grupo se vincula a un Periodo real (FK) en lugar del texto 'I'/'II'
-- Idempotente: puede ejecutarse varias veces sin errores.

-- 1. Columna periodo_id (se agrega nullable para poder poblarla)
ALTER TABLE grupos ADD COLUMN IF NOT EXISTS periodo_id integer;

-- 2. Poblar desde la columna antigua periodo (texto) + gestión
UPDATE grupos g
SET periodo_id = p.id
FROM periodos p
JOIN gestiones ge ON ge.id = p."gestionId"
WHERE g.periodo_id IS NULL
  AND ge.anio = g.gestion
  AND p.numero = UPPER(BTRIM(g.periodo));

-- 3. Exigir no nulo (falla con mensaje claro si algún grupo no pudo mapearse)
DO $$
DECLARE
  huerfanos integer;
BEGIN
  SELECT count(*) INTO huerfanos FROM grupos WHERE periodo_id IS NULL;
  IF huerfanos > 0 THEN
    RAISE EXCEPTION 'No se pudo mapear el periodo de % grupo(s): revisa la gestión/periodo de origen', huerfanos;
  END IF;
END $$;

ALTER TABLE grupos ALTER COLUMN periodo_id SET NOT NULL;

-- 4. Llave foránea a periodos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'grupos'::regclass AND lower(conname) = 'fk_grupo_periodo'
  ) THEN
    ALTER TABLE grupos ADD CONSTRAINT "FK_grupo_periodo"
      FOREIGN KEY (periodo_id) REFERENCES periodos(id);
  END IF;
END $$;

-- 5. Restricción de unicidad incluyendo periodo_id
DO $$
DECLARE
  nombre text;
BEGIN
  SELECT conname INTO nombre FROM pg_constraint
  WHERE conrelid = 'grupos'::regclass AND lower(conname) = 'uq_grupo_combinacion';
  IF nombre IS NOT NULL THEN
    EXECUTE format('ALTER TABLE grupos DROP CONSTRAINT %I', nombre);
  END IF;

  ALTER TABLE grupos ADD CONSTRAINT "UQ_grupo_combinacion"
    UNIQUE (gestion, carrera_id, periodo_id, semestre, turno_id, paralelo);
END $$;

-- 6. Eliminar la columna antigua (ya reemplazada por periodo_id)
ALTER TABLE grupos DROP COLUMN IF EXISTS periodo;
