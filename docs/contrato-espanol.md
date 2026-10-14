# Contrato de traducción al español (SITBT)

Objetivo: TODO en español, nada en inglés (textos visibles, nombres de campos, variables,
interfaces, mensajes, rutas y logs). La API del backend ya devuelve campos en español;
el frontend debe coincidir EXACTAMENTE con esos nombres.

Reglas:
- No cambiar comportamiento ni lógica, sólo nombres de identificadores y textos.
- Respetar los nombres exactos que devuelve la API (ver tabla abajo).
- No romper la compilación de TypeScript.
- Comentarios, mensajes de error/consola y textos JSX: en español.

## Campos de la API (nombre correcto en español)

### Carrera
id, codigo, nombre, area, titulo, descripcion, horasCarga, estado, creadoEn, actualizadoEn

### Materia
id, codigo, nombre, creadoEn, actualizadoEn

### PlanEstudio
id, carreraId, numeroRm, fechaRm, estado, notas, creadoEn, actualizadoEn, carrera

### Turno
id, codigo, nombre, horaInicio, horaFin, creadoEn, actualizadoEn

### Gestion
id, anio, tipoPeriodo, estado, esActual, notas, creadoEn, actualizadoEn, periodos

### Periodo
id, gestionId, numero, nombre, fechaInicio, fechaFin, estado, notas, creadoEn, actualizadoEn

### Rol
id, codigo, nombre, descripcion, estado, creadoEn, actualizadoEn

### Usuario
id, nombreUsuario, correo, rol, roles[{id,codigo,nombre}], personaId, personaId, estado, persona, creadoEn, actualizadoEn

### Persona
id, ci, nombres, apellidoPaterno, apellidoMaterno, fechaNacimiento, lugarNacimiento,
lugarNacimientoOtro, genero, estadoCivil, nacionalidad, nacionalidadOtra, dobleNacionalidad,
numeroPasaporte, tipoSangre, discapacidad, numeroLibretaMilitar, lenguaMaterna, telefono,
correo, direccion, fotoUrl, estado, creadoEn, actualizadoEn

### Estudiante
id, personaId, persona, numeroTituloBachiller, fechaTituloBachiller, gestionAdmision,
numeroFolder, codigoInscripcion, codigoFormulario01, carreraId, carrera, planEstudioId,
fechaAdmision, estado, estadoMatricula, origen, solicitudAdmisionId, verificadoPor,
fechaVerificacion, fechaPreRegistro, creadoEn, actualizadoEn

### Personal (docente/administrativo)
id, personaId, persona, profesion, cargo, fechaContrato, estado, creadoEn, actualizadoEn

### Grupo
id, codigo, carreraId, planEstudioId, materiaId, semestre, turnoId, paralelo, gestion,
periodo, capacidad, creadoEn, actualizadoEn

### Inscripcion
id, estudianteId, materiaId, materiaPlanId, grupoId, gestion, semestre, estado, notaFinal,
creadoEn, actualizadoEn

### Calificacion
id, inscripcionId, parcial1, parcial2, promedioFinal, observacion, estadoRegular,
aptoSegundaTurno, notaSegundaTurno, segundaTurnoAplicado, estado2T, notaDefinitiva,
estadoDefinitivo, registradoPor, registradoEn, actualizadoEn

### Pago
id, estudianteId, conceptoId, gestion, monto, fechaPago, metodoPago, numeroRecibo,
recibidoPor, estado, notas, creadoEn, actualizadoEn

### Certificado
id, estudianteId, tipo, fecha, codigo, emitidoPor, creadoEn

### Credencial
id, estudianteId, gestion, gestionId, semestre, fechaEmision, validoHasta, fotoUrl,
estado, emitidoPor, impreso, tipoEmision, vigenciaHasta, qrVerificacion, estadoEntrega,
entregadoA, fechaEntrega, notas, creadoEn, actualizadoEn

### ConfiguracionInstitucional (endpoint /public)
nombre, nombre_corto, lema, logo_url, direccion, telefono, departamento, correo,
website, ciudad, pais, descripcion

### SolicitudAdmision
id, nombre, apellidoPaterno, apellidoMaterno, ci, fechaNacimiento, lugarNacimiento,
lugarNacimientoOtro, genero, estadoCivil, nacionalidad, nacionalidadOtra, telefono, correo,
direccion, nombreTutor, ciTutor, telefonoTutor, carreraId, carrera, estado, observaciones,
verificadoPor, fechaVerificacion, origen, documentoCiPath, certificadoBachillerPath, fotoPath,
estudianteConvertidoId, creadoEn, actualizadoEn

## Equivalencias de identificadores frecuentes (inglés -> español)
- name -> nombre
- code -> codigo
- title -> titulo
- description -> descripcion
- status -> estado
- created_at / createdAt -> creadoEn
- updated_at / updatedAt -> actualizadoEn
- load_hours / hours -> horasCarga / horas
- first_name / firstName / names -> nombres
- last_name_paternal / lastNamePaternal -> apellidoPaterno
- last_name_maternal / lastNameMaternal -> apellidoMaterno
- birthdate / birth_date -> fechaNacimiento
- birthplace -> lugarNacimiento
- birthplace_other -> lugarNacimientoOtro
- gender -> genero
- marital_status / marital_estado -> estadoCivil
- nationality -> nacionalidad
- dual_nationality / dual_nacionalidad -> dobleNacionalidad
- passport_number / passport_numero -> numeroPasaporte
- blood_type -> tipoSangre
- disability -> discapacidad
- military_book_number -> numeroLibretaMilitar
- mother_tongue -> lenguaMaterna
- phone -> telefono
- email -> correo
- address -> direccion
- photo_url -> fotoUrl
- careerId -> carreraId
- studentId / student_id -> estudianteId
- groupId / group_id -> grupoId
- enrollmentId -> inscripcionId
- person_id -> personaId
- teacherId -> docenteId
- subjectId -> materiaId
- subjects -> materias
- students -> estudiantes
- grades -> calificaciones
- payments -> pagos
- loading -> cargando
- error -> error
- fetch -> obtener / cargar
- handleSubmit -> manejarEnviar
- search -> busqueda
- weekly_hours -> horasSemanales
- rm_number -> numeroRm
- rm_date -> fechaRm
- duration -> duracion
- requirements -> requisitos
- start_date -> fechaInicio
- end_date -> fechaFin
- year -> anio
- period_type -> tipoPeriodo
- is_current -> esActual
- notes -> notas
- semester -> semestre
