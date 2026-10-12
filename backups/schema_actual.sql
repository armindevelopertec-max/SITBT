--
-- PostgreSQL database dump
--

\restrict mW72ZMwhSsM2Sjr0PAvxv0PF0sgZsobNsgFPCckkVpLcaOXiOGKWcJVy7gow1QV

-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: admission_requests_gender_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.admission_requests_gender_enum AS ENUM (
    'M',
    'F'
);


--
-- Name: admission_requests_origen_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.admission_requests_origen_enum AS ENUM (
    'web',
    'secretaria'
);


--
-- Name: careers_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.careers_status_enum AS ENUM (
    'activo',
    'inactivo'
);


--
-- Name: consent_records_derechoejercido_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.consent_records_derechoejercido_enum AS ENUM (
    'access',
    'rectification',
    'deletion'
);


--
-- Name: credentials_estado_entrega_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.credentials_estado_entrega_enum AS ENUM (
    'generado',
    'impreso',
    'entregado'
);


--
-- Name: credentials_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.credentials_status_enum AS ENUM (
    'emitida',
    'anulada',
    'reemplazada'
);


--
-- Name: credentials_tipo_emision_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.credentials_tipo_emision_enum AS ENUM (
    'primera',
    'renovacion',
    'reimpresion'
);


--
-- Name: emitted_documents_estado_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.emitted_documents_estado_enum AS ENUM (
    'generado',
    'impreso',
    'entregado',
    'anulado'
);


--
-- Name: emitted_documents_tipo_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.emitted_documents_tipo_enum AS ENUM (
    'boleta_inscripcion',
    'recibo_pago',
    'carnet',
    'certificado',
    'constancia',
    'record_academico'
);


--
-- Name: enrollments_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enrollments_status_enum AS ENUM (
    'cursando',
    'aprobado',
    'reprobado',
    'convalidada'
);


--
-- Name: equivalences_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.equivalences_type_enum AS ENUM (
    'automatica',
    'manual'
);


--
-- Name: gestiones_period_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.gestiones_period_type_enum AS ENUM (
    'semestral'
);


--
-- Name: gestiones_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.gestiones_status_enum AS ENUM (
    'abierta',
    'cerrada',
    'pendiente'
);


--
-- Name: grades_status_2t_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.grades_status_2t_enum AS ENUM (
    'aprobado',
    'reprobado',
    'no_presento',
    'no_aplica'
);


--
-- Name: grades_status_definitivo_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.grades_status_definitivo_enum AS ENUM (
    'aprobado',
    'reprobado',
    'no_presento'
);


--
-- Name: grades_status_regular_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.grades_status_regular_enum AS ENUM (
    'aprobado',
    'reprobado',
    'no_presento'
);


--
-- Name: payment_concepts_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payment_concepts_status_enum AS ENUM (
    'activo',
    'inactivo'
);


--
-- Name: payment_concepts_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payment_concepts_type_enum AS ENUM (
    'unico',
    'semestral'
);


--
-- Name: payments_payment_method_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payments_payment_method_enum AS ENUM (
    'efectivo',
    'transferencia',
    'qr'
);


--
-- Name: payments_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payments_status_enum AS ENUM (
    'pagado',
    'anulado',
    'pendiente'
);


--
-- Name: periodos_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.periodos_status_enum AS ENUM (
    'abierta',
    'cerrada',
    'pendiente'
);


--
-- Name: persons_blood_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.persons_blood_type_enum AS ENUM (
    'A+',
    'A-',
    'B+',
    'B-',
    'AB+',
    'AB-',
    'O+',
    'O-'
);


--
-- Name: persons_gender_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.persons_gender_enum AS ENUM (
    'M',
    'F'
);


--
-- Name: persons_marital_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.persons_marital_status_enum AS ENUM (
    'Soltera(o)',
    'Casada(o)',
    'Viuda(o)',
    'Divorciada(o)'
);


--
-- Name: persons_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.persons_status_enum AS ENUM (
    'activo',
    'inactivo'
);


--
-- Name: roles_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.roles_status_enum AS ENUM (
    'activo',
    'inactivo'
);


--
-- Name: staff_position_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.staff_position_enum AS ENUM (
    'docente',
    'secretaria',
    'director_academico',
    'rector',
    'apoyo',
    'bibliotecario'
);


--
-- Name: staff_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.staff_status_enum AS ENUM (
    'activo',
    'inactivo',
    'licencia'
);


--
-- Name: student_convalidations_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.student_convalidations_status_enum AS ENUM (
    'pendiente',
    'aprobada',
    'rechazada'
);


--
-- Name: student_convalidations_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.student_convalidations_type_enum AS ENUM (
    'plan_migration',
    'external_transfer',
    'transitabilidad'
);


--
-- Name: students_estado_matricula_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.students_estado_matricula_enum AS ENUM (
    'pre_registro',
    'verificado',
    'matriculado',
    'egresado',
    'retirado'
);


--
-- Name: students_origen_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.students_origen_enum AS ENUM (
    'web',
    'secretaria'
);


--
-- Name: students_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.students_status_enum AS ENUM (
    'activo',
    'egresado',
    'titulado',
    'congelado',
    'baja'
);


--
-- Name: study_plans_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.study_plans_status_enum AS ENUM (
    'vigente',
    'historico'
);


--
-- Name: teaching_assignments_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.teaching_assignments_status_enum AS ENUM (
    'activo',
    'finalizado'
);


--
-- Name: users_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.users_status_enum AS ENUM (
    'activo',
    'inactivo',
    'bloqueado'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admission_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admission_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nombre character varying(100) NOT NULL,
    ci character varying(20) NOT NULL,
    fecha_nacimiento date NOT NULL,
    email character varying(100) NOT NULL,
    nombre_tutor character varying(100),
    ci_tutor character varying(20),
    telefono_tutor character varying(20),
    carrera_id integer,
    observaciones text,
    verificado_por integer,
    fecha_verificacion timestamp without time zone,
    documento_ci_path character varying(255),
    certificado_bachiller_path character varying(255),
    foto_path character varying(255),
    converted_student_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    apellido_paterno character varying(100),
    apellido_materno character varying(100),
    birthplace character varying(100),
    birthplace_other character varying(100),
    gender public.admission_requests_gender_enum,
    marital_status character varying(50),
    nationality character varying(50),
    nationality_other character varying(100),
    phone character varying(20),
    address character varying(200),
    origen public.admission_requests_origen_enum DEFAULT 'web'::public.admission_requests_origen_enum NOT NULL,
    estado character varying(20) DEFAULT 'pendiente'::character varying NOT NULL
);


--
-- Name: audit_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_log (
    id integer NOT NULL,
    user_id integer,
    action character varying(50) NOT NULL,
    "table" character varying(50) NOT NULL,
    record_id integer,
    old_value text,
    new_value text,
    date timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: audit_log_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.audit_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: audit_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.audit_log_id_seq OWNED BY public.audit_log.id;


--
-- Name: careers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.careers (
    id integer NOT NULL,
    code character varying(10) NOT NULL,
    name character varying(100) NOT NULL,
    area character varying(100),
    title character varying(150) NOT NULL,
    description text,
    load_hours integer DEFAULT 3600 NOT NULL,
    status public.careers_status_enum DEFAULT 'activo'::public.careers_status_enum NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: careers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.careers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: careers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.careers_id_seq OWNED BY public.careers.id;


--
-- Name: certificates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.certificates (
    id integer NOT NULL,
    student_id integer NOT NULL,
    type character varying(50) NOT NULL,
    date date NOT NULL,
    code character varying(30) NOT NULL,
    issued_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: certificates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.certificates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: certificates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.certificates_id_seq OWNED BY public.certificates.id;


--
-- Name: consent_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.consent_records (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    estudiante_id integer NOT NULL,
    registrado_por integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    "versionPolitica" character varying(20) NOT NULL,
    "fechaConsentimiento" timestamp without time zone NOT NULL,
    "ipConsentimiento" character varying(45),
    "nombreTutor" character varying(100),
    "ciTutor" character varying(20),
    "firmaBase64" text,
    "consentimientoTutor" boolean DEFAULT false NOT NULL,
    "derechoEjercido" public.consent_records_derechoejercido_enum,
    "derechoFecha" timestamp without time zone
);


--
-- Name: credentials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.credentials (
    id integer NOT NULL,
    student_id integer NOT NULL,
    gestion character varying(10) NOT NULL,
    issued_date date NOT NULL,
    valid_until date NOT NULL,
    photo_url character varying(255),
    status public.credentials_status_enum DEFAULT 'emitida'::public.credentials_status_enum NOT NULL,
    issued_by integer NOT NULL,
    printed boolean DEFAULT false NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    semester integer NOT NULL,
    gestion_id integer,
    vigencia_hasta character varying(20),
    qr_verificacion character varying(255),
    entregado_a integer,
    fecha_entrega timestamp without time zone,
    tipo_emision public.credentials_tipo_emision_enum DEFAULT 'primera'::public.credentials_tipo_emision_enum NOT NULL,
    estado_entrega public.credentials_estado_entrega_enum DEFAULT 'generado'::public.credentials_estado_entrega_enum NOT NULL
);


--
-- Name: credentials_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.credentials_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: credentials_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.credentials_id_seq OWNED BY public.credentials.id;


--
-- Name: emitted_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.emitted_documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    estudiante_id integer NOT NULL,
    gestion character varying(10) NOT NULL,
    gestion_id integer,
    impreso_por integer,
    observaciones text,
    related_payment_id integer,
    related_credential_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    "numeroDocumento" character varying(50) NOT NULL,
    "fechaEmision" timestamp without time zone DEFAULT now() NOT NULL,
    "pdfPath" character varying(255),
    "entregadoA" character varying(100),
    "fechaEntrega" timestamp without time zone,
    tipo public.emitted_documents_tipo_enum NOT NULL,
    estado public.emitted_documents_estado_enum DEFAULT 'generado'::public.emitted_documents_estado_enum NOT NULL
);


--
-- Name: enrollments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.enrollments (
    id integer NOT NULL,
    student_id integer NOT NULL,
    subject_id integer NOT NULL,
    group_id integer NOT NULL,
    gestion character varying(10) NOT NULL,
    semester integer NOT NULL,
    status public.enrollments_status_enum DEFAULT 'cursando'::public.enrollments_status_enum NOT NULL,
    final_grade integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    plan_subject_id integer
);


--
-- Name: enrollments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.enrollments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: enrollments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.enrollments_id_seq OWNED BY public.enrollments.id;


--
-- Name: equivalences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.equivalences (
    id integer NOT NULL,
    source_subject_id integer NOT NULL,
    target_subject_id integer NOT NULL,
    type public.equivalences_type_enum NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: equivalences_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.equivalences_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: equivalences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.equivalences_id_seq OWNED BY public.equivalences.id;


--
-- Name: gestion_status_enum; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gestion_status_enum (
    value character varying(20) NOT NULL
);


--
-- Name: gestiones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gestiones (
    id integer NOT NULL,
    year character varying(10) NOT NULL,
    is_current boolean DEFAULT false NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    period_type public.gestiones_period_type_enum DEFAULT 'semestral'::public.gestiones_period_type_enum NOT NULL,
    status public.gestiones_status_enum DEFAULT 'pendiente'::public.gestiones_status_enum NOT NULL
);


--
-- Name: gestiones_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.gestiones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: gestiones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.gestiones_id_seq OWNED BY public.gestiones.id;


--
-- Name: grade_audit; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.grade_audit (
    id integer NOT NULL,
    grade_id integer NOT NULL,
    field_changed character varying(30) NOT NULL,
    old_value character varying(50),
    new_value character varying(50),
    user_id integer NOT NULL,
    changed_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: grade_audit_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.grade_audit_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: grade_audit_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.grade_audit_id_seq OWNED BY public.grade_audit.id;


--
-- Name: grades; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.grades (
    id integer NOT NULL,
    enrollment_id integer NOT NULL,
    partial_1 integer,
    partial_2 integer,
    final_average integer,
    observation character varying(30),
    status_regular public.grades_status_regular_enum,
    second_turn_eligible boolean DEFAULT false NOT NULL,
    second_turn_score integer,
    second_turn_applied boolean DEFAULT false NOT NULL,
    status_2t public.grades_status_2t_enum DEFAULT 'no_aplica'::public.grades_status_2t_enum NOT NULL,
    definitive_grade integer,
    status_definitivo public.grades_status_definitivo_enum,
    registered_by integer,
    registered_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: grades_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.grades_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: grades_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.grades_id_seq OWNED BY public.grades.id;


--
-- Name: group_students; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.group_students (
    id integer NOT NULL,
    group_id integer NOT NULL,
    student_id integer NOT NULL,
    enrolled_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: group_students_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.group_students_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: group_students_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.group_students_id_seq OWNED BY public.group_students.id;


--
-- Name: groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.groups (
    id integer NOT NULL,
    career_id integer NOT NULL,
    study_plan_id integer NOT NULL,
    semester integer NOT NULL,
    shift_id integer NOT NULL,
    parallel character varying(5) NOT NULL,
    gestion character varying(10) NOT NULL,
    capacity integer DEFAULT 30 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    code character varying,
    subject_id integer,
    periodo character varying(2) DEFAULT 'I'::character varying NOT NULL
);


--
-- Name: groups_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.groups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.groups_id_seq OWNED BY public.groups.id;


--
-- Name: institution_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.institution_settings (
    id integer NOT NULL,
    nombre character varying(255) NOT NULL,
    nombre_corto character varying(50) NOT NULL,
    lema character varying(255),
    logo_url character varying(500),
    direccion character varying(500),
    telefono character varying(50),
    email character varying(100),
    website character varying(100),
    ciudad character varying(100),
    pais character varying(100) DEFAULT 'Bolivia'::character varying NOT NULL,
    descripcion text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    departamento character varying(100)
);


--
-- Name: institution_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.institution_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: institution_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.institution_settings_id_seq OWNED BY public.institution_settings.id;


--
-- Name: payment_concepts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_concepts (
    id integer NOT NULL,
    code character varying(20) NOT NULL,
    name character varying(100) NOT NULL,
    type public.payment_concepts_type_enum NOT NULL,
    default_amount numeric(10,2) NOT NULL,
    description text,
    status public.payment_concepts_status_enum DEFAULT 'activo'::public.payment_concepts_status_enum NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: payment_concepts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payment_concepts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payment_concepts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payment_concepts_id_seq OWNED BY public.payment_concepts.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id integer NOT NULL,
    student_id integer NOT NULL,
    concept_id integer NOT NULL,
    gestion character varying(10) NOT NULL,
    amount numeric(10,2) NOT NULL,
    payment_date timestamp without time zone NOT NULL,
    payment_method public.payments_payment_method_enum NOT NULL,
    receipt_number character varying(30),
    received_by integer NOT NULL,
    status public.payments_status_enum DEFAULT 'pagado'::public.payments_status_enum NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: period_type_enum; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.period_type_enum (
    value character varying(20) NOT NULL
);


--
-- Name: periodos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.periodos (
    id integer NOT NULL,
    gestion_id integer NOT NULL,
    number character varying(10) NOT NULL,
    name character varying(50),
    start_date date NOT NULL,
    end_date date NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    status public.periodos_status_enum DEFAULT 'pendiente'::public.periodos_status_enum NOT NULL
);


--
-- Name: periodos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.periodos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: periodos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.periodos_id_seq OWNED BY public.periodos.id;


--
-- Name: persons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.persons (
    id integer NOT NULL,
    ci character varying(20) NOT NULL,
    names character varying(100) NOT NULL,
    lastname_paternal character varying(50) NOT NULL,
    lastname_maternal character varying(50) NOT NULL,
    birthdate date NOT NULL,
    birthplace character varying(100),
    gender public.persons_gender_enum NOT NULL,
    marital_status public.persons_marital_status_enum,
    nationality character varying(50) DEFAULT 'Boliviana'::character varying NOT NULL,
    dual_nationality character varying(50),
    passport_number character varying(30),
    blood_type public.persons_blood_type_enum,
    disability character varying(100),
    military_book_number character varying(30),
    mother_tongue character varying(50),
    phone character varying(20),
    email character varying(100),
    address character varying(200),
    photo_url character varying(255),
    status public.persons_status_enum DEFAULT 'activo'::public.persons_status_enum NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    birthplace_other character varying(100),
    nationality_other character varying(100)
);


--
-- Name: persons_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.persons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: persons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.persons_id_seq OWNED BY public.persons.id;


--
-- Name: plan_subjects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.plan_subjects (
    id integer NOT NULL,
    study_plan_id integer NOT NULL,
    subject_id integer NOT NULL,
    semester integer NOT NULL,
    weekly_hours integer NOT NULL,
    prerequisite_id integer
);


--
-- Name: plan_subjects_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.plan_subjects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: plan_subjects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.plan_subjects_id_seq OWNED BY public.plan_subjects.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    code character varying(30) NOT NULL,
    name character varying(50) NOT NULL,
    description text,
    status public.roles_status_enum DEFAULT 'activo'::public.roles_status_enum NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: shifts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shifts (
    id integer NOT NULL,
    code character varying(10) NOT NULL,
    name character varying(20) NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: shifts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.shifts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: shifts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.shifts_id_seq OWNED BY public.shifts.id;


--
-- Name: staff; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.staff (
    id integer NOT NULL,
    person_id integer NOT NULL,
    profesion character varying(100),
    cargo character varying(50) NOT NULL,
    fecha_contrato date NOT NULL,
    estado character varying(20) NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: staff_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.staff_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: staff_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.staff_id_seq OWNED BY public.staff.id;


--
-- Name: student_convalidations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_convalidations (
    id integer NOT NULL,
    student_id integer NOT NULL,
    equivalence_id integer,
    target_subject_id integer NOT NULL,
    type public.student_convalidations_type_enum NOT NULL,
    resolution_number character varying(50),
    resolution_date date,
    status public.student_convalidations_status_enum DEFAULT 'pendiente'::public.student_convalidations_status_enum NOT NULL,
    approved_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: student_convalidations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.student_convalidations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: student_convalidations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.student_convalidations_id_seq OWNED BY public.student_convalidations.id;


--
-- Name: students; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.students (
    id integer NOT NULL,
    person_id integer NOT NULL,
    admission_gestion character varying(10) NOT NULL,
    folder_number character varying(20),
    inscription_code character varying(30) NOT NULL,
    form01_code character varying(30),
    career_id integer NOT NULL,
    study_plan_id integer NOT NULL,
    admission_date date NOT NULL,
    status public.students_status_enum DEFAULT 'activo'::public.students_status_enum NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    bachelor_title_number character varying(50),
    bachelor_title_date date,
    admission_request_id character varying(100),
    verificado_por integer,
    fecha_verificacion timestamp without time zone,
    fecha_pre_registro timestamp without time zone,
    estado_matricula public.students_estado_matricula_enum DEFAULT 'matriculado'::public.students_estado_matricula_enum NOT NULL,
    origen public.students_origen_enum DEFAULT 'secretaria'::public.students_origen_enum NOT NULL
);


--
-- Name: students_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.students_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: students_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.students_id_seq OWNED BY public.students.id;


--
-- Name: study_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.study_plans (
    id integer NOT NULL,
    career_id integer NOT NULL,
    rm_number character varying(50) NOT NULL,
    rm_date date NOT NULL,
    status public.study_plans_status_enum DEFAULT 'vigente'::public.study_plans_status_enum NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: study_plans_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.study_plans_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: study_plans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.study_plans_id_seq OWNED BY public.study_plans.id;


--
-- Name: subjects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subjects (
    id integer NOT NULL,
    code character varying(20) NOT NULL,
    name character varying(150) NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: subjects_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.subjects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: subjects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.subjects_id_seq OWNED BY public.subjects.id;


--
-- Name: teaching_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teaching_assignments (
    id integer NOT NULL,
    teacher_id integer NOT NULL,
    subject_id integer NOT NULL,
    group_id integer NOT NULL,
    gestion character varying(10) NOT NULL,
    status public.teaching_assignments_status_enum DEFAULT 'activo'::public.teaching_assignments_status_enum NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: teaching_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.teaching_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: teaching_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.teaching_assignments_id_seq OWNED BY public.teaching_assignments.id;


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id integer NOT NULL,
    user_id integer NOT NULL,
    role_id integer NOT NULL,
    assigned_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: user_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_roles_id_seq OWNED BY public.user_roles.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    person_id integer NOT NULL,
    username character varying(50) NOT NULL,
    password_hash character varying(255) NOT NULL,
    status public.users_status_enum DEFAULT 'activo'::public.users_status_enum NOT NULL,
    last_login timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: audit_log id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log ALTER COLUMN id SET DEFAULT nextval('public.audit_log_id_seq'::regclass);


--
-- Name: careers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.careers ALTER COLUMN id SET DEFAULT nextval('public.careers_id_seq'::regclass);


--
-- Name: certificates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificates ALTER COLUMN id SET DEFAULT nextval('public.certificates_id_seq'::regclass);


--
-- Name: credentials id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credentials ALTER COLUMN id SET DEFAULT nextval('public.credentials_id_seq'::regclass);


--
-- Name: enrollments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrollments ALTER COLUMN id SET DEFAULT nextval('public.enrollments_id_seq'::regclass);


--
-- Name: equivalences id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equivalences ALTER COLUMN id SET DEFAULT nextval('public.equivalences_id_seq'::regclass);


--
-- Name: gestiones id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gestiones ALTER COLUMN id SET DEFAULT nextval('public.gestiones_id_seq'::regclass);


--
-- Name: grade_audit id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grade_audit ALTER COLUMN id SET DEFAULT nextval('public.grade_audit_id_seq'::regclass);


--
-- Name: grades id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grades ALTER COLUMN id SET DEFAULT nextval('public.grades_id_seq'::regclass);


--
-- Name: group_students id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_students ALTER COLUMN id SET DEFAULT nextval('public.group_students_id_seq'::regclass);


--
-- Name: groups id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups ALTER COLUMN id SET DEFAULT nextval('public.groups_id_seq'::regclass);


--
-- Name: institution_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.institution_settings ALTER COLUMN id SET DEFAULT nextval('public.institution_settings_id_seq'::regclass);


--
-- Name: payment_concepts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_concepts ALTER COLUMN id SET DEFAULT nextval('public.payment_concepts_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: periodos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.periodos ALTER COLUMN id SET DEFAULT nextval('public.periodos_id_seq'::regclass);


--
-- Name: persons id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.persons ALTER COLUMN id SET DEFAULT nextval('public.persons_id_seq'::regclass);


--
-- Name: plan_subjects id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_subjects ALTER COLUMN id SET DEFAULT nextval('public.plan_subjects_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: shifts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shifts ALTER COLUMN id SET DEFAULT nextval('public.shifts_id_seq'::regclass);


--
-- Name: staff id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff ALTER COLUMN id SET DEFAULT nextval('public.staff_id_seq'::regclass);


--
-- Name: student_convalidations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_convalidations ALTER COLUMN id SET DEFAULT nextval('public.student_convalidations_id_seq'::regclass);


--
-- Name: students id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students ALTER COLUMN id SET DEFAULT nextval('public.students_id_seq'::regclass);


--
-- Name: study_plans id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.study_plans ALTER COLUMN id SET DEFAULT nextval('public.study_plans_id_seq'::regclass);


--
-- Name: subjects id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subjects ALTER COLUMN id SET DEFAULT nextval('public.subjects_id_seq'::regclass);


--
-- Name: teaching_assignments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teaching_assignments ALTER COLUMN id SET DEFAULT nextval('public.teaching_assignments_id_seq'::regclass);


--
-- Name: user_roles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles ALTER COLUMN id SET DEFAULT nextval('public.user_roles_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: audit_log PK_07fefa57f7f5ab8fc3f52b3ed0b; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT "PK_07fefa57f7f5ab8fc3f52b3ed0b" PRIMARY KEY (id);


--
-- Name: study_plans PK_0e9610ccbc3b79324da329edb33; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.study_plans
    ADD CONSTRAINT "PK_0e9610ccbc3b79324da329edb33" PRIMARY KEY (id);


--
-- Name: payment_concepts PK_134d520b7a53a13d26fdfcce097; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_concepts
    ADD CONSTRAINT "PK_134d520b7a53a13d26fdfcce097" PRIMARY KEY (id);


--
-- Name: payments PK_197ab7af18c93fbb0c9b28b4a59; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY (id);


--
-- Name: subjects PK_1a023685ac2b051b4e557b0b280; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT "PK_1a023685ac2b051b4e557b0b280" PRIMARY KEY (id);


--
-- Name: credentials PK_1e38bc43be6697cdda548ad27a6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credentials
    ADD CONSTRAINT "PK_1e38bc43be6697cdda548ad27a6" PRIMARY KEY (id);


--
-- Name: grades PK_4740fb6f5df2505a48649f1687b; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT "PK_4740fb6f5df2505a48649f1687b" PRIMARY KEY (id);


--
-- Name: groups PK_659d1483316afb28afd3a90646e; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT "PK_659d1483316afb28afd3a90646e" PRIMARY KEY (id);


--
-- Name: persons PK_74278d8812a049233ce41440ac7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.persons
    ADD CONSTRAINT "PK_74278d8812a049233ce41440ac7" PRIMARY KEY (id);


--
-- Name: enrollments PK_7c0f752f9fb68bf6ed7367ab00f; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT "PK_7c0f752f9fb68bf6ed7367ab00f" PRIMARY KEY (id);


--
-- Name: students PK_7d7f07271ad4ce999880713f05e; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT "PK_7d7f07271ad4ce999880713f05e" PRIMARY KEY (id);


--
-- Name: shifts PK_84d692e367e4d6cdf045828768c; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT "PK_84d692e367e4d6cdf045828768c" PRIMARY KEY (id);


--
-- Name: user_roles PK_8acd5cf26ebd158416f477de799; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT "PK_8acd5cf26ebd158416f477de799" PRIMARY KEY (id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: institution_settings PK_a9fb1e4f7e94a1cd19593fba2a3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.institution_settings
    ADD CONSTRAINT "PK_a9fb1e4f7e94a1cd19593fba2a3" PRIMARY KEY (id);


--
-- Name: teaching_assignments PK_baf0d10098561a9840957b512e0; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teaching_assignments
    ADD CONSTRAINT "PK_baf0d10098561a9840957b512e0" PRIMARY KEY (id);


--
-- Name: student_convalidations PK_bdea5444465c452094310916a01; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_convalidations
    ADD CONSTRAINT "PK_bdea5444465c452094310916a01" PRIMARY KEY (id);


--
-- Name: grade_audit PK_bf9f20cb2493f4fb84e6daf19d8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grade_audit
    ADD CONSTRAINT "PK_bf9f20cb2493f4fb84e6daf19d8" PRIMARY KEY (id);


--
-- Name: roles PK_c1433d71a4838793a49dcad46ab; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY (id);


--
-- Name: group_students PK_cd596d1c8176853f748dc44af4b; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_students
    ADD CONSTRAINT "PK_cd596d1c8176853f748dc44af4b" PRIMARY KEY (id);


--
-- Name: certificates PK_e4c7e31e2144300bea7d89eb165; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT "PK_e4c7e31e2144300bea7d89eb165" PRIMARY KEY (id);


--
-- Name: staff PK_e4ee98bb552756c180aec1e854a; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT "PK_e4ee98bb552756c180aec1e854a" PRIMARY KEY (id);


--
-- Name: equivalences PK_fa52f8cd69f004bf8bc126e3a48; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equivalences
    ADD CONSTRAINT "PK_fa52f8cd69f004bf8bc126e3a48" PRIMARY KEY (id);


--
-- Name: careers PK_febfc45dc83d58090d3122fde3d; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.careers
    ADD CONSTRAINT "PK_febfc45dc83d58090d3122fde3d" PRIMARY KEY (id);


--
-- Name: users UQ_5ed72dcd00d6e5a88c6a6ba3d18; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_5ed72dcd00d6e5a88c6a6ba3d18" UNIQUE (person_id);


--
-- Name: payment_concepts UQ_7755a72122164f5862ba6e60cf2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_concepts
    ADD CONSTRAINT "UQ_7755a72122164f5862ba6e60cf2" UNIQUE (code);


--
-- Name: groups UQ_8989cafa0945a366f0c8716e609; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT "UQ_8989cafa0945a366f0c8716e609" UNIQUE (code);


--
-- Name: students UQ_92c76644f5a8b29010bb29c8d81; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT "UQ_92c76644f5a8b29010bb29c8d81" UNIQUE (inscription_code);


--
-- Name: persons UQ_95019f3e3f694f93b3edc32d859; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.persons
    ADD CONSTRAINT "UQ_95019f3e3f694f93b3edc32d859" UNIQUE (ci);


--
-- Name: shifts UQ_afa68167f7aeb87bc93ab8d9065; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT "UQ_afa68167f7aeb87bc93ab8d9065" UNIQUE (code);


--
-- Name: certificates UQ_e9e6937f74d9a653f0fc3299132; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT "UQ_e9e6937f74d9a653f0fc3299132" UNIQUE (code);


--
-- Name: careers UQ_ee40b65408fc3927faa74d478a8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.careers
    ADD CONSTRAINT "UQ_ee40b65408fc3927faa74d478a8" UNIQUE (code);


--
-- Name: roles UQ_f6d54f95c31b73fb1bdd8e91d0c; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT "UQ_f6d54f95c31b73fb1bdd8e91d0c" UNIQUE (code);


--
-- Name: users UQ_fe0bb3f6520ee0469504521e710; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE (username);


--
-- Name: admission_requests admission_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admission_requests
    ADD CONSTRAINT admission_requests_pkey PRIMARY KEY (id);


--
-- Name: consent_records consent_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consent_records
    ADD CONSTRAINT consent_records_pkey PRIMARY KEY (id);


--
-- Name: emitted_documents emitted_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.emitted_documents
    ADD CONSTRAINT emitted_documents_pkey PRIMARY KEY (id);


--
-- Name: gestion_status_enum gestion_status_enum_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gestion_status_enum
    ADD CONSTRAINT gestion_status_enum_pkey PRIMARY KEY (value);


--
-- Name: gestiones gestiones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gestiones
    ADD CONSTRAINT gestiones_pkey PRIMARY KEY (id);


--
-- Name: gestiones gestiones_year_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gestiones
    ADD CONSTRAINT gestiones_year_key UNIQUE (year);


--
-- Name: period_type_enum period_type_enum_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.period_type_enum
    ADD CONSTRAINT period_type_enum_pkey PRIMARY KEY (value);


--
-- Name: periodos periodos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.periodos
    ADD CONSTRAINT periodos_pkey PRIMARY KEY (id);


--
-- Name: plan_subjects plan_subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_subjects
    ADD CONSTRAINT plan_subjects_pkey PRIMARY KEY (id);


--
-- Name: equivalences FK_0345d7d8e0a07ec361194a5dacf; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equivalences
    ADD CONSTRAINT "FK_0345d7d8e0a07ec361194a5dacf" FOREIGN KEY (target_subject_id) REFERENCES public.subjects(id);


--
-- Name: payments FK_0f18f39254cf228e8a5d40e33dc; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "FK_0f18f39254cf228e8a5d40e33dc" FOREIGN KEY (concept_id) REFERENCES public.payment_concepts(id);


--
-- Name: emitted_documents FK_1615bd75ae007fe8233e9702a81; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.emitted_documents
    ADD CONSTRAINT "FK_1615bd75ae007fe8233e9702a81" FOREIGN KEY (impreso_por) REFERENCES public.users(id);


--
-- Name: groups FK_170e51fa2eea18a7f11015293b9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT "FK_170e51fa2eea18a7f11015293b9" FOREIGN KEY (career_id) REFERENCES public.careers(id);


--
-- Name: consent_records FK_1fac695552e3aa3f482bd6bf28c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consent_records
    ADD CONSTRAINT "FK_1fac695552e3aa3f482bd6bf28c" FOREIGN KEY (registrado_por) REFERENCES public.users(id);


--
-- Name: emitted_documents FK_20c27bd49ccaff93967b253e666; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.emitted_documents
    ADD CONSTRAINT "FK_20c27bd49ccaff93967b253e666" FOREIGN KEY (gestion_id) REFERENCES public.gestiones(id);


--
-- Name: equivalences FK_20f64b8cf1e4a11eccc229065ea; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equivalences
    ADD CONSTRAINT "FK_20f64b8cf1e4a11eccc229065ea" FOREIGN KEY (source_subject_id) REFERENCES public.subjects(id);


--
-- Name: grades FK_2356f7bc0d70427aae84ff86a45; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT "FK_2356f7bc0d70427aae84ff86a45" FOREIGN KEY (registered_by) REFERENCES public.staff(id);


--
-- Name: certificates FK_254f3859dcd4d99b0213f90d754; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT "FK_254f3859dcd4d99b0213f90d754" FOREIGN KEY (issued_by) REFERENCES public.users(id);


--
-- Name: enrollments FK_307813fe255896d6ebf3e6cd55c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT "FK_307813fe255896d6ebf3e6cd55c" FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: student_convalidations FK_37c915da384aea79f5291333819; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_convalidations
    ADD CONSTRAINT "FK_37c915da384aea79f5291333819" FOREIGN KEY (equivalence_id) REFERENCES public.equivalences(id);


--
-- Name: groups FK_3f53eae6d19505ac6b86f74f7e4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT "FK_3f53eae6d19505ac6b86f74f7e4" FOREIGN KEY (shift_id) REFERENCES public.shifts(id);


--
-- Name: teaching_assignments FK_41ec23a5853e01d7607405c4a8e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teaching_assignments
    ADD CONSTRAINT "FK_41ec23a5853e01d7607405c4a8e" FOREIGN KEY (subject_id) REFERENCES public.subjects(id);


--
-- Name: student_convalidations FK_4dee1cdcc5264ac61e843a0331a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_convalidations
    ADD CONSTRAINT "FK_4dee1cdcc5264ac61e843a0331a" FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: emitted_documents FK_509a4e6489c778801e39d336f25; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.emitted_documents
    ADD CONSTRAINT "FK_509a4e6489c778801e39d336f25" FOREIGN KEY (estudiante_id) REFERENCES public.students(id);


--
-- Name: enrollments FK_52e3e34305ad0800648eab215ed; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT "FK_52e3e34305ad0800648eab215ed" FOREIGN KEY (group_id) REFERENCES public.groups(id);


--
-- Name: students FK_5dffbda00c34ee406d6abccbc59; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT "FK_5dffbda00c34ee406d6abccbc59" FOREIGN KEY (person_id) REFERENCES public.persons(id);


--
-- Name: users FK_5ed72dcd00d6e5a88c6a6ba3d18; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "FK_5ed72dcd00d6e5a88c6a6ba3d18" FOREIGN KEY (person_id) REFERENCES public.persons(id);


--
-- Name: grade_audit FK_5f653731e3c90b8d0b9b62077d1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grade_audit
    ADD CONSTRAINT "FK_5f653731e3c90b8d0b9b62077d1" FOREIGN KEY (grade_id) REFERENCES public.grades(id);


--
-- Name: certificates FK_5fc025803a5eb21001b77ed6b1a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT "FK_5fc025803a5eb21001b77ed6b1a" FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: groups FK_7b24e8606e84ff83ddb755325af; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT "FK_7b24e8606e84ff83ddb755325af" FOREIGN KEY (study_plan_id) REFERENCES public.study_plans(id);


--
-- Name: teaching_assignments FK_7eb84b6d68b1db6cc46b5fcea98; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teaching_assignments
    ADD CONSTRAINT "FK_7eb84b6d68b1db6cc46b5fcea98" FOREIGN KEY (teacher_id) REFERENCES public.staff(id);


--
-- Name: consent_records FK_821bb790e6b228cf6499359d7c1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consent_records
    ADD CONSTRAINT "FK_821bb790e6b228cf6499359d7c1" FOREIGN KEY (estudiante_id) REFERENCES public.students(id);


--
-- Name: group_students FK_86ac11b05c01e9981dd4e4ba39e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_students
    ADD CONSTRAINT "FK_86ac11b05c01e9981dd4e4ba39e" FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: user_roles FK_87b8888186ca9769c960e926870; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT "FK_87b8888186ca9769c960e926870" FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: group_students FK_8b5b7bb7e2c2f1a8e4319ae3394; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_students
    ADD CONSTRAINT "FK_8b5b7bb7e2c2f1a8e4319ae3394" FOREIGN KEY (group_id) REFERENCES public.groups(id);


--
-- Name: enrollments FK_931f4e1d2848270a4ec594bda59; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT "FK_931f4e1d2848270a4ec594bda59" FOREIGN KEY (subject_id) REFERENCES public.subjects(id);


--
-- Name: periodos FK_96acc243482e2c0538d5f1068fd; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.periodos
    ADD CONSTRAINT "FK_96acc243482e2c0538d5f1068fd" FOREIGN KEY (gestion_id) REFERENCES public.gestiones(id);


--
-- Name: groups FK_9e8acf6ea1f157f77e9571bbcf6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT "FK_9e8acf6ea1f157f77e9571bbcf6" FOREIGN KEY (subject_id) REFERENCES public.subjects(id);


--
-- Name: plan_subjects FK_9f09befb7ebccf7931000dade84; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_subjects
    ADD CONSTRAINT "FK_9f09befb7ebccf7931000dade84" FOREIGN KEY (study_plan_id) REFERENCES public.study_plans(id);


--
-- Name: payments FK_9fd5d6ef620b0140a67ff2d95c4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "FK_9fd5d6ef620b0140a67ff2d95c4" FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: payments FK_addd19c06574aa904472b8c82bd; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "FK_addd19c06574aa904472b8c82bd" FOREIGN KEY (received_by) REFERENCES public.users(id);


--
-- Name: students FK_b199d2a42eaa4f2d5a80c67c784; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT "FK_b199d2a42eaa4f2d5a80c67c784" FOREIGN KEY (study_plan_id) REFERENCES public.study_plans(id);


--
-- Name: user_roles FK_b23c65e50a758245a33ee35fda1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT "FK_b23c65e50a758245a33ee35fda1" FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- Name: study_plans FK_b2f3f53ae4eccf53260313c7ab0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.study_plans
    ADD CONSTRAINT "FK_b2f3f53ae4eccf53260313c7ab0" FOREIGN KEY (career_id) REFERENCES public.careers(id);


--
-- Name: grade_audit FK_b687ef7f466a64e8e3e2d0d4561; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grade_audit
    ADD CONSTRAINT "FK_b687ef7f466a64e8e3e2d0d4561" FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: plan_subjects FK_b797f226b902d953f0f1aa2ec2d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_subjects
    ADD CONSTRAINT "FK_b797f226b902d953f0f1aa2ec2d" FOREIGN KEY (subject_id) REFERENCES public.subjects(id);


--
-- Name: credentials FK_ba3db63bbdc0d2623ceb1503aa6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credentials
    ADD CONSTRAINT "FK_ba3db63bbdc0d2623ceb1503aa6" FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: student_convalidations FK_ba8b8f005fc6ffe5ae83f230102; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_convalidations
    ADD CONSTRAINT "FK_ba8b8f005fc6ffe5ae83f230102" FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: staff FK_c14d9b13c0956338a99c4d4494e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT "FK_c14d9b13c0956338a99c4d4494e" FOREIGN KEY (person_id) REFERENCES public.persons(id);


--
-- Name: credentials FK_ca4d4b8b3c6671d4a836222d308; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credentials
    ADD CONSTRAINT "FK_ca4d4b8b3c6671d4a836222d308" FOREIGN KEY (gestion_id) REFERENCES public.gestiones(id);


--
-- Name: audit_log FK_cb11bd5b662431ea0ac455a27d7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT "FK_cb11bd5b662431ea0ac455a27d7" FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: grades FK_ce4136a5756d2fe2ee20fe01a3d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT "FK_ce4136a5756d2fe2ee20fe01a3d" FOREIGN KEY (enrollment_id) REFERENCES public.enrollments(id);


--
-- Name: credentials FK_ce695c13faf18f2ab2f3147396c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credentials
    ADD CONSTRAINT "FK_ce695c13faf18f2ab2f3147396c" FOREIGN KEY (issued_by) REFERENCES public.users(id);


--
-- Name: enrollments FK_db11d42c81733778aed0d5cbcd6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT "FK_db11d42c81733778aed0d5cbcd6" FOREIGN KEY (plan_subject_id) REFERENCES public.plan_subjects(id);


--
-- Name: plan_subjects FK_e0ed77f8a4f5b0faecc01a3905b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_subjects
    ADD CONSTRAINT "FK_e0ed77f8a4f5b0faecc01a3905b" FOREIGN KEY (prerequisite_id) REFERENCES public.subjects(id);


--
-- Name: student_convalidations FK_e7d0837b171ecb5730216086d59; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_convalidations
    ADD CONSTRAINT "FK_e7d0837b171ecb5730216086d59" FOREIGN KEY (target_subject_id) REFERENCES public.subjects(id);


--
-- Name: students FK_ef7ae3a7e1eed50ece919e84ede; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT "FK_ef7ae3a7e1eed50ece919e84ede" FOREIGN KEY (career_id) REFERENCES public.careers(id);


--
-- Name: admission_requests FK_f035d7441035b9f644259b982bb; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admission_requests
    ADD CONSTRAINT "FK_f035d7441035b9f644259b982bb" FOREIGN KEY (carrera_id) REFERENCES public.careers(id);


--
-- Name: teaching_assignments FK_fd0768536f876db6d66d98e29f8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teaching_assignments
    ADD CONSTRAINT "FK_fd0768536f876db6d66d98e29f8" FOREIGN KEY (group_id) REFERENCES public.groups(id);


--
-- PostgreSQL database dump complete
--

\unrestrict mW72ZMwhSsM2Sjr0PAvxv0PF0sgZsobNsgFPCckkVpLcaOXiOGKWcJVy7gow1QV

