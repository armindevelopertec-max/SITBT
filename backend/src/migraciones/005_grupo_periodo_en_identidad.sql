-- Migración 005: el periodo forma parte de la identidad del grupo
-- Idempotente: puede ejecutarse varias veces sin errores.
-- - Recrea la restricción de unicidad incluyendo el periodo.
-- - Actualiza los códigos existentes al formato CARRERA-GESTION-PERIODO-SS-T-P.

-- 1. Restricción única (gestión, carrera, periodo, semestre, turno, paralelo)
DO $$
DECLARE
  nombre_constraint text;
BEGIN
  -- Elimina cualquier restricción previa con ese nombre (conservando su capitalización real)
  SELECT conname INTO nombre_constraint
  FROM pg_constraint
  WHERE conrelid = 'grupos'::regclass
    AND lower(conname) = 'uq_grupo_combinacion';

  IF nombre_constraint IS NOT NULL THEN
    EXECUTE format('ALTER TABLE grupos DROP CONSTRAINT %I', nombre_constraint);
  END IF;

  -- El nombre debe ir entre comillas para conservar mayúsculas, igual que lo crea TypeORM
  ALTER TABLE grupos
    ADD CONSTRAINT "UQ_grupo_combinacion"
    UNIQUE (gestion, carrera_id, periodo, semestre, turno_id, paralelo);
END $$;

-- 2. Regenerar el código incluyendo el periodo (formato CARRERA-GESTION-PERIODO-SS-T-P)
UPDATE grupos g
SET codigo =
  UPPER(c.codigo) || '-' || g.gestion || '-' || UPPER(COALESCE(g.periodo, 'I')) || '-' ||
  LPAD(g.semestre::text, 2, '0') || '-' ||
  UPPER(LEFT(BTRIM(t.codigo), 1)) || '-' || g.paralelo
FROM carreras c, turnos t
WHERE g.carrera_id = c.id
  AND g.turno_id = t.id;
