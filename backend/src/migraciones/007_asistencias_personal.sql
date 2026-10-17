-- Migración 007: control de asistencias del personal (huellas + marcaciones)
-- Idempotente: puede ejecutarse varias veces sin errores.

-- 1. Huellas enroladas del personal
CREATE TABLE IF NOT EXISTS huellas_personal (
  id                SERIAL PRIMARY KEY,
  "personalId"      integer NOT NULL REFERENCES personal(id) ON DELETE CASCADE,
  codigo_biometrico varchar(50) NOT NULL UNIQUE,
  dedo              varchar(30),
  plantilla         text,
  estado            varchar(20) NOT NULL DEFAULT 'activa',
  creado_en         timestamptz NOT NULL DEFAULT now(),
  actualizado_en    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_huellas_personal_personal ON huellas_personal ("personalId");

-- 2. Marcaciones (un evento por cada entrada/salida)
CREATE TABLE IF NOT EXISTS marcaciones_personal (
  id          SERIAL PRIMARY KEY,
  "personalId" integer NOT NULL REFERENCES personal(id) ON DELETE CASCADE,
  "huellaId"  integer REFERENCES huellas_personal(id) ON DELETE SET NULL,
  tipo        varchar(10) NOT NULL,
  metodo      varchar(20) NOT NULL DEFAULT 'biometrico',
  dispositivo varchar(100),
  observacion varchar(255),
  fecha_hora  timestamptz NOT NULL DEFAULT now(),
  creado_en   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_marcaciones_personal_personal_fecha
  ON marcaciones_personal ("personalId", fecha_hora);
CREATE INDEX IF NOT EXISTS idx_marcaciones_personal_fecha
  ON marcaciones_personal (fecha_hora);
