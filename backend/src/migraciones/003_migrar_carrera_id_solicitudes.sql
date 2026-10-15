-- 003_migrar_carrera_id_solicitudes.sql
--
-- Corrige la discrepancia entre dos columnas de la tabla solicitudes_admision:
--   * carrera_id  -> columna de la relación (con clave foránea a carreras)
--   * "carreraId" -> columna escalar que creaba TypeORM con synchronize
--
-- La entidad escribía el valor en "carreraId" mientras que la relación
-- (leftJoinAndSelect) leía carrera_id, que quedaba siempre NULL; por eso el
-- panel de admisión mostraba la carrera como "-".
--
-- IMPORTANTE: ejecutar este script ANTES de desplegar la versión del backend
-- que apunta la propiedad carreraId a la columna carrera_id, porque
-- synchronize elimina la columna "carreraId" al arrancar y se perdería el dato.
--
-- Idempotente: solo copia valores cuando carrera_id está vacío.

BEGIN;

UPDATE solicitudes_admision
SET carrera_id = "carreraId"
WHERE carrera_id IS NULL
  AND "carreraId" IS NOT NULL;

COMMIT;
