-- Migration: Add missing columns to admission_requests
-- Date: 2026-03-10

ALTER TABLE admission_requests
  ADD COLUMN IF NOT EXISTS apellido_paterno VARCHAR(100),
  ADD COLUMN IF NOT EXISTS apellido_materno VARCHAR(100),
  ADD COLUMN IF NOT EXISTS birthplace VARCHAR(100),
  ADD COLUMN IF NOT EXISTS birthplace_other VARCHAR(100),
  ADD COLUMN IF NOT EXISTS gender VARCHAR(1),
  ADD COLUMN IF NOT EXISTS marital_status VARCHAR(50),
  ADD COLUMN IF NOT EXISTS nationality VARCHAR(50),
  ADD COLUMN IF NOT EXISTS nationality_other VARCHAR(100);
