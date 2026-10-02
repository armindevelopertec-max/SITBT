-- Migration: Add admission, consent, and documents tables
-- Date: 2026-01-01

-- 1. Admission Requests
CREATE TABLE IF NOT EXISTS admission_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL,
    ci VARCHAR(20) NOT NULL,
    ci_issued VARCHAR(5),
    fecha_nacimiento DATE NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(100) NOT NULL,
    direccion VARCHAR(200),
    nombre_tutor VARCHAR(100),
    ci_tutor VARCHAR(20),
    telefono_tutor VARCHAR(20),
    genero VARCHAR(1),
    carrera_id INTEGER,
    estado VARCHAR(20) DEFAULT 'pendiente',
    observaciones TEXT,
    verificado_por INTEGER,
    fecha_verificacion TIMESTAMP,
    origen VARCHAR(20) DEFAULT 'web',
    documento_ci_path VARCHAR(255),
    certificado_bachiller_path VARCHAR(255),
    foto_path VARCHAR(255),
    converted_student_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Consent Records
CREATE TABLE IF NOT EXISTS consent_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estudiante_id INTEGER NOT NULL,
    version_politica VARCHAR(20) NOT NULL,
    fecha_consentimiento TIMESTAMP NOT NULL,
    ip_consentimiento VARCHAR(45),
    nombre_tutor VARCHAR(100),
    ci_tutor VARCHAR(20),
    firma_base64 TEXT,
    consentimiento_tutor BOOLEAN DEFAULT FALSE,
    derecho_ejercido VARCHAR(20),
    derecho_fecha TIMESTAMP,
    registrado_por INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Emitted Documents
CREATE TABLE IF NOT EXISTS emitted_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estudiante_id INTEGER NOT NULL,
    tipo VARCHAR(30) NOT NULL,
    numero_documento VARCHAR(50) NOT NULL,
    gestion VARCHAR(10) NOT NULL,
    gestion_id INTEGER,
    fecha_emision TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    pdf_path VARCHAR(255),
    entregado_a VARCHAR(100),
    fecha_entrega TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'generado',
    impreso_por INTEGER,
    observaciones TEXT,
    related_payment_id INTEGER,
    related_credential_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Add columns to students table
ALTER TABLE students ADD COLUMN IF NOT EXISTS estado_matricula VARCHAR(20) DEFAULT 'matriculado';
ALTER TABLE students ADD COLUMN IF NOT EXISTS origen VARCHAR(20) DEFAULT 'secretaria';
ALTER TABLE students ADD COLUMN IF NOT EXISTS admission_request_id VARCHAR(100);
ALTER TABLE students ADD COLUMN IF NOT EXISTS verificado_por INTEGER;
ALTER TABLE students ADD COLUMN IF NOT EXISTS fecha_verificacion TIMESTAMP;
ALTER TABLE students ADD COLUMN IF NOT EXISTS fecha_pre_registro TIMESTAMP;

-- 5. Add columns to credentials table
ALTER TABLE credentials ADD COLUMN IF NOT EXISTS tipo_emision VARCHAR(20) DEFAULT 'primera';
ALTER TABLE credentials ADD COLUMN IF NOT EXISTS vigencia_hasta VARCHAR(20);
ALTER TABLE credentials ADD COLUMN IF NOT EXISTS qr_verificacion VARCHAR(255);
ALTER TABLE credentials ADD COLUMN IF NOT EXISTS estado_entrega VARCHAR(20) DEFAULT 'generado';
ALTER TABLE credentials ADD COLUMN IF NOT EXISTS entregado_a INTEGER;
ALTER TABLE credentials ADD COLUMN IF NOT EXISTS fecha_entrega TIMESTAMP;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admission_requests_estado ON admission_requests(estado);
CREATE INDEX IF NOT EXISTS idx_admission_requests_ci ON admission_requests(ci);
CREATE INDEX IF NOT EXISTS idx_consent_records_estudiante ON consent_records(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_emitted_documents_estudiante ON emitted_documents(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_emitted_documents_tipo ON emitted_documents(tipo);
CREATE INDEX IF NOT EXISTS idx_students_estado_matricula ON students(estado_matricula);
