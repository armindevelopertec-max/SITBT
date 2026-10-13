DO $$
DECLARE
  v_carrera_id INT;
  v_plan_id INT;
  v_gestion_id INT;
  v_turno_id INT;
BEGIN
  SELECT id INTO v_gestion_id FROM gestiones WHERE anio = '2026' AND es_actual = true LIMIT 1;
  IF v_gestion_id IS NULL THEN
    INSERT INTO gestiones (anio, tipo_periodo, estado, es_actual, notas, creado_en, actualizado_en)
      VALUES ('2026', 'semestral', 'abierta', true, 'Gestion 2026', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id INTO v_gestion_id;
  END IF;

  SELECT id INTO v_turno_id FROM turnos WHERE codigo = 'MAÑANA' LIMIT 1;
  IF v_turno_id IS NULL THEN
    INSERT INTO turnos (codigo, nombre, hora_inicio, hora_fin, creado_en, actualizado_en)
      VALUES ('MAÑANA', 'Turno Mañana', '07:00:00', '12:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id INTO v_turno_id;
  END IF;


  SELECT id INTO v_carrera_id FROM carreras WHERE codigo = 'AUT';
  IF v_carrera_id IS NULL THEN
    INSERT INTO carreras (codigo, nombre, titulo, area, horas_carga, estado, descripcion, creado_en, actualizado_en)
      VALUES ('AUT', 'Autotrónica', 'Técnico en Autotrónica', 'Tecnología', 3600, 'activo', 'Plan importado de autotronica.json', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id INTO v_carrera_id;
  END IF;

  SELECT id INTO v_plan_id FROM planes_estudio WHERE carrera_id = v_carrera_id AND numero_rm = 'RM-2026-AUT';
  IF v_plan_id IS NULL THEN
    INSERT INTO planes_estudio (carrera_id, numero_rm, fecha_rm, estado, notas, creado_en, actualizado_en)
      VALUES (v_carrera_id, 'RM-2026-AUT', '2026-01-15', 'vigente', 'Plan AUT - Autotrónica', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id INTO v_plan_id;
  END IF;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('SOM-100', 'Seguridad Ocupacional y Medio Ambiente', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 1, 4 FROM materias WHERE codigo = 'SOM-100' ON CONFLICT DO NOTHING;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('MAA-100', 'Matemática Aplicada', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 1, 4 FROM materias WHERE codigo = 'MAA-100' ON CONFLICT DO NOTHING;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('EMC-100', 'Electricidad del Motor y Carrocería I', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 1, 4 FROM materias WHERE codigo = 'EMC-100' ON CONFLICT DO NOTHING;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('MEA-100', 'Metrología Automotriz', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 1, 6 FROM materias WHERE codigo = 'MEA-100' ON CONFLICT DO NOTHING;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('MGD-100', 'Motores a Gasolina y Diésel I', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 1, 6 FROM materias WHERE codigo = 'MGD-100' ON CONFLICT DO NOTHING;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('TRA-100', 'Transmisiones', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 1, 6 FROM materias WHERE codigo = 'TRA-100' ON CONFLICT DO NOTHING;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('INT-200', 'Inglés Técnico', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 2, 4 FROM materias WHERE codigo = 'INT-200' ON CONFLICT DO NOTHING;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('FIS-200', 'Física Aplicada', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 2, 4 FROM materias WHERE codigo = 'FIS-200' ON CONFLICT DO NOTHING;

  UPDATE materias_plan SET prerrequisito_id = (SELECT id FROM materias WHERE codigo = 'MAA-100') WHERE plan_estudio_id = v_plan_id AND materia_id = (SELECT id FROM materias WHERE codigo = 'FIS-200') AND prerrequisito_id IS NULL;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('EMC-200', 'Electricidad del Motor y Carrocería II', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 2, 4 FROM materias WHERE codigo = 'EMC-200' ON CONFLICT DO NOTHING;

  UPDATE materias_plan SET prerrequisito_id = (SELECT id FROM materias WHERE codigo = 'EMC-100') WHERE plan_estudio_id = v_plan_id AND materia_id = (SELECT id FROM materias WHERE codigo = 'EMC-200') AND prerrequisito_id IS NULL;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('CIF-200', 'Circuitos de Fluidos', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 2, 6 FROM materias WHERE codigo = 'CIF-200' ON CONFLICT DO NOTHING;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('MGD-200', 'Motores a Gasolina y Diése II', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 2, 6 FROM materias WHERE codigo = 'MGD-200' ON CONFLICT DO NOTHING;

  UPDATE materias_plan SET prerrequisito_id = (SELECT id FROM materias WHERE codigo = 'MGD-100') WHERE plan_estudio_id = v_plan_id AND materia_id = (SELECT id FROM materias WHERE codigo = 'MGD-200') AND prerrequisito_id IS NULL;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('DIT-200', 'Dibujo Técnico', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 2, 2 FROM materias WHERE codigo = 'DIT-200' ON CONFLICT DO NOTHING;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('SIA-200', 'Sistema de Iluminación Automotriz', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 2, 4 FROM materias WHERE codigo = 'SIA-200' ON CONFLICT DO NOTHING;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('SIM-300', 'Sistema del Motor', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 3, 6 FROM materias WHERE codigo = 'SIM-300' ON CONFLICT DO NOTHING;

  UPDATE materias_plan SET prerrequisito_id = (SELECT id FROM materias WHERE codigo = 'MGD-200') WHERE plan_estudio_id = v_plan_id AND materia_id = (SELECT id FROM materias WHERE codigo = 'SIM-300') AND prerrequisito_id IS NULL;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('VHE-300', 'Vehículos Híbridos y Eléctricos', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 3, 6 FROM materias WHERE codigo = 'VHE-300' ON CONFLICT DO NOTHING;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('PRO-300', 'Programación', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 3, 4 FROM materias WHERE codigo = 'PRO-300' ON CONFLICT DO NOTHING;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('CAC-300', 'Circuitos de Arranque y Carga', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 3, 6 FROM materias WHERE codigo = 'CAC-300' ON CONFLICT DO NOTHING;

  UPDATE materias_plan SET prerrequisito_id = (SELECT id FROM materias WHERE codigo = 'SIA-200') WHERE plan_estudio_id = v_plan_id AND materia_id = (SELECT id FROM materias WHERE codigo = 'CAC-300') AND prerrequisito_id IS NULL;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('IGA-300', 'Inyección a Gasolina', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 3, 4 FROM materias WHERE codigo = 'IGA-300' ON CONFLICT DO NOTHING;

  UPDATE materias_plan SET prerrequisito_id = (SELECT id FROM materias WHERE codigo = 'MGD-200') WHERE plan_estudio_id = v_plan_id AND materia_id = (SELECT id FROM materias WHERE codigo = 'IGA-300') AND prerrequisito_id IS NULL;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('AUT-300', 'Autotrónica I', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 3, 4 FROM materias WHERE codigo = 'AUT-300' ON CONFLICT DO NOTHING;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('EDA-400', 'Electrónica Digital del Automóvil', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 4, 6 FROM materias WHERE codigo = 'EDA-400' ON CONFLICT DO NOTHING;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('MAN-400', 'Mantenimiento del Automóvil', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 4, 4 FROM materias WHERE codigo = 'MAN-400' ON CONFLICT DO NOTHING;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('EAA-400', 'Electrónica Analógica del Automóvil', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 4, 6 FROM materias WHERE codigo = 'EAA-400' ON CONFLICT DO NOTHING;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('MIC-400', 'Microcontroladores', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 4, 6 FROM materias WHERE codigo = 'MIC-400' ON CONFLICT DO NOTHING;

  UPDATE materias_plan SET prerrequisito_id = (SELECT id FROM materias WHERE codigo = 'PRO-300') WHERE plan_estudio_id = v_plan_id AND materia_id = (SELECT id FROM materias WHERE codigo = 'MIC-400') AND prerrequisito_id IS NULL;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('RMD-400', 'Reparación de Motores a Diése', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 4, 4 FROM materias WHERE codigo = 'RMD-400' ON CONFLICT DO NOTHING;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('AUT-400', 'Autotrónica II', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 4, 4 FROM materias WHERE codigo = 'AUT-400' ON CONFLICT DO NOTHING;

  UPDATE materias_plan SET prerrequisito_id = (SELECT id FROM materias WHERE codigo = 'AUT-300') WHERE plan_estudio_id = v_plan_id AND materia_id = (SELECT id FROM materias WHERE codigo = 'AUT-400') AND prerrequisito_id IS NULL;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('IEG-500', 'Inyección Electrónica a Gasolina', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 5, 4 FROM materias WHERE codigo = 'IEG-500' ON CONFLICT DO NOTHING;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('ATM-500', 'Automatización', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 5, 4 FROM materias WHERE codigo = 'ATM-500' ON CONFLICT DO NOTHING;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('RMP-500', 'Redes Multiplexadas y Protocolos', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 5, 6 FROM materias WHERE codigo = 'RMP-500' ON CONFLICT DO NOTHING;

  UPDATE materias_plan SET prerrequisito_id = (SELECT id FROM materias WHERE codigo = 'MIC-400') WHERE plan_estudio_id = v_plan_id AND materia_id = (SELECT id FROM materias WHERE codigo = 'RMP-500') AND prerrequisito_id IS NULL;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('RSA-500', 'Reparación de Caja Automática', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 5, 4 FROM materias WHERE codigo = 'RSA-500' ON CONFLICT DO NOTHING;

  UPDATE materias_plan SET prerrequisito_id = (SELECT id FROM materias WHERE codigo = 'MAN-400') WHERE plan_estudio_id = v_plan_id AND materia_id = (SELECT id FROM materias WHERE codigo = 'RSA-500') AND prerrequisito_id IS NULL;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('LAU-500', 'Laboratorio Autotrónica I', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 5, 4 FROM materias WHERE codigo = 'LAU-500' ON CONFLICT DO NOTHING;

  UPDATE materias_plan SET prerrequisito_id = (SELECT id FROM materias WHERE codigo = 'AUT-400') WHERE plan_estudio_id = v_plan_id AND materia_id = (SELECT id FROM materias WHERE codigo = 'LAU-500') AND prerrequisito_id IS NULL;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('EMP-500', 'Emprendimiento Productivo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 5, 4 FROM materias WHERE codigo = 'EMP-500' ON CONFLICT DO NOTHING;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('TMG-500', 'Taller de Modalidad de Graduación I', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 5, 4 FROM materias WHERE codigo = 'TMG-500' ON CONFLICT DO NOTHING;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('PMI-600', 'Potenciamiento del Motor a Inyección Electrónica', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 6, 4 FROM materias WHERE codigo = 'PMI-600' ON CONFLICT DO NOTHING;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('SCO-600', 'Seguridad y Confort', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 6, 6 FROM materias WHERE codigo = 'SCO-600' ON CONFLICT DO NOTHING;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('IED-600', 'Inyección Electrónica a Diése', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 6, 6 FROM materias WHERE codigo = 'IED-600' ON CONFLICT DO NOTHING;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('SHI-600', 'Sistemas Híbridos', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 6, 4 FROM materias WHERE codigo = 'SHI-600' ON CONFLICT DO NOTHING;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('LAU-600', 'Laboratorio Autotrónica II', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 6, 4 FROM materias WHERE codigo = 'LAU-600' ON CONFLICT DO NOTHING;

  UPDATE materias_plan SET prerrequisito_id = (SELECT id FROM materias WHERE codigo = 'LAU-500') WHERE plan_estudio_id = v_plan_id AND materia_id = (SELECT id FROM materias WHERE codigo = 'LAU-600') AND prerrequisito_id IS NULL;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('ENE-600', 'Electroneumática', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 6, 2 FROM materias WHERE codigo = 'ENE-600' ON CONFLICT DO NOTHING;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('TMG-600', 'Taller de Modalidad de Graduación II', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 6, 4 FROM materias WHERE codigo = 'TMG-600' ON CONFLICT DO NOTHING;

  UPDATE materias_plan SET prerrequisito_id = (SELECT id FROM materias WHERE codigo = 'TMG-500') WHERE plan_estudio_id = v_plan_id AND materia_id = (SELECT id FROM materias WHERE codigo = 'TMG-600') AND prerrequisito_id IS NULL;


  SELECT id INTO v_carrera_id FROM carreras WHERE codigo = 'MEC';
  IF v_carrera_id IS NULL THEN
    INSERT INTO carreras (codigo, nombre, titulo, area, horas_carga, estado, descripcion, creado_en, actualizado_en)
      VALUES ('MEC', 'Mecánica Automotriz', 'Técnico en Mecánica Automotriz', 'Tecnología', 3600, 'activo', 'Plan importado de mecanica_automotriz.json', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id INTO v_carrera_id;
  END IF;

  SELECT id INTO v_plan_id FROM planes_estudio WHERE carrera_id = v_carrera_id AND numero_rm = 'RM-2026-MEC';
  IF v_plan_id IS NULL THEN
    INSERT INTO planes_estudio (carrera_id, numero_rm, fecha_rm, estado, notas, creado_en, actualizado_en)
      VALUES (v_carrera_id, 'RM-2026-MEC', '2026-01-15', 'vigente', 'Plan MEC - Mecánica Automotriz', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id INTO v_plan_id;
  END IF;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('SOM-100', 'Seguridad Ocupacional y Medio Ambiente', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 1, 4 FROM materias WHERE codigo = 'SOM-100' ON CONFLICT DO NOTHING;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('MOG-100', 'Motores a Gasolina I', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 1, 6 FROM materias WHERE codigo = 'MOG-100' ON CONFLICT DO NOTHING;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('ELA-100', 'Electricidad Automotriz I', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 1, 6 FROM materias WHERE codigo = 'ELA-100' ON CONFLICT DO NOTHING;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('MAA-100', 'Matemática Automotriz', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 1, 4 FROM materias WHERE codigo = 'MAA-100' ON CONFLICT DO NOTHING;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('MEA-100', 'Metrología Automotriz', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 1, 4 FROM materias WHERE codigo = 'MEA-100' ON CONFLICT DO NOTHING;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('DTA-100', 'Dibujo Técnico Automotriz I', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 1, 2 FROM materias WHERE codigo = 'DTA-100' ON CONFLICT DO NOTHING;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('QUA-100', 'Química Automotriz', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 1, 4 FROM materias WHERE codigo = 'QUA-100' ON CONFLICT DO NOTHING;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('INT-200', 'Inglés Técnico', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 2, 4 FROM materias WHERE codigo = 'INT-200' ON CONFLICT DO NOTHING;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('MOG-200', 'Motores a Gasolina II', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 2, 6 FROM materias WHERE codigo = 'MOG-200' ON CONFLICT DO NOTHING;

  UPDATE materias_plan SET prerrequisito_id = (SELECT id FROM materias WHERE codigo = 'MOG-100') WHERE plan_estudio_id = v_plan_id AND materia_id = (SELECT id FROM materias WHERE codigo = 'MOG-200') AND prerrequisito_id IS NULL;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('ELA-200', 'Electricidad Automotriz II', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 2, 6 FROM materias WHERE codigo = 'ELA-200' ON CONFLICT DO NOTHING;

  UPDATE materias_plan SET prerrequisito_id = (SELECT id FROM materias WHERE codigo = 'ELA-100') WHERE plan_estudio_id = v_plan_id AND materia_id = (SELECT id FROM materias WHERE codigo = 'ELA-200') AND prerrequisito_id IS NULL;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('CHS-200', 'Chapería y Soldadura', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 2, 6 FROM materias WHERE codigo = 'CHS-200' ON CONFLICT DO NOTHING;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('FIS-200', 'Física Automotriz', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 2, 4 FROM materias WHERE codigo = 'FIS-200' ON CONFLICT DO NOTHING;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('DTA-200', 'Dibujo Técnico Automotriz II', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 2, 4 FROM materias WHERE codigo = 'DTA-200' ON CONFLICT DO NOTHING;

  UPDATE materias_plan SET prerrequisito_id = (SELECT id FROM materias WHERE codigo = 'DTA-100') WHERE plan_estudio_id = v_plan_id AND materia_id = (SELECT id FROM materias WHERE codigo = 'DTA-200') AND prerrequisito_id IS NULL;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('MOG-300', 'Motores a Gasolina III', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 3, 6 FROM materias WHERE codigo = 'MOG-300' ON CONFLICT DO NOTHING;

  UPDATE materias_plan SET prerrequisito_id = (SELECT id FROM materias WHERE codigo = 'MOG-200') WHERE plan_estudio_id = v_plan_id AND materia_id = (SELECT id FROM materias WHERE codigo = 'MOG-300') AND prerrequisito_id IS NULL;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('ELA-300', 'Electricidad Automotriz III', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 3, 4 FROM materias WHERE codigo = 'ELA-300' ON CONFLICT DO NOTHING;

  UPDATE materias_plan SET prerrequisito_id = (SELECT id FROM materias WHERE codigo = 'ELA-200') WHERE plan_estudio_id = v_plan_id AND materia_id = (SELECT id FROM materias WHERE codigo = 'ELA-300') AND prerrequisito_id IS NULL;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('MOD-300', 'Motores Diése I', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 3, 4 FROM materias WHERE codigo = 'MOD-300' ON CONFLICT DO NOTHING;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('ETA-300', 'Electrónica Automotriz I', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 3, 6 FROM materias WHERE codigo = 'ETA-300' ON CONFLICT DO NOTHING;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('TER-300', 'Termodinámica', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 3, 2 FROM materias WHERE codigo = 'TER-300' ON CONFLICT DO NOTHING;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('TRA-300', 'Transmisiones I', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 3, 8 FROM materias WHERE codigo = 'TRA-300' ON CONFLICT DO NOTHING;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('MOG-400', 'Motores a Gasolina IV', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 4, 6 FROM materias WHERE codigo = 'MOG-400' ON CONFLICT DO NOTHING;

  UPDATE materias_plan SET prerrequisito_id = (SELECT id FROM materias WHERE codigo = 'MOG-300') WHERE plan_estudio_id = v_plan_id AND materia_id = (SELECT id FROM materias WHERE codigo = 'MOG-400') AND prerrequisito_id IS NULL;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('IAG-400', 'Inyección a Gasolina I', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 4, 6 FROM materias WHERE codigo = 'IAG-400' ON CONFLICT DO NOTHING;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('MOD-400', 'Motores Diése II', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 4, 4 FROM materias WHERE codigo = 'MOD-400' ON CONFLICT DO NOTHING;

  UPDATE materias_plan SET prerrequisito_id = (SELECT id FROM materias WHERE codigo = 'MOD-300') WHERE plan_estudio_id = v_plan_id AND materia_id = (SELECT id FROM materias WHERE codigo = 'MOD-400') AND prerrequisito_id IS NULL;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('ETA-400', 'Electrónica Automotriz II', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 4, 6 FROM materias WHERE codigo = 'ETA-400' ON CONFLICT DO NOTHING;

  UPDATE materias_plan SET prerrequisito_id = (SELECT id FROM materias WHERE codigo = 'ETA-300') WHERE plan_estudio_id = v_plan_id AND materia_id = (SELECT id FROM materias WHERE codigo = 'ETA-400') AND prerrequisito_id IS NULL;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('TRA-400', 'Transmisiones II', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 4, 4 FROM materias WHERE codigo = 'TRA-400' ON CONFLICT DO NOTHING;

  UPDATE materias_plan SET prerrequisito_id = (SELECT id FROM materias WHERE codigo = 'TRA-300') WHERE plan_estudio_id = v_plan_id AND materia_id = (SELECT id FROM materias WHERE codigo = 'TRA-400') AND prerrequisito_id IS NULL;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('EMP-400', 'Emprendimiento Productivo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 4, 4 FROM materias WHERE codigo = 'EMP-400' ON CONFLICT DO NOTHING;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('IED-500', 'Inyección Electrónica Diése I', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 5, 4 FROM materias WHERE codigo = 'IED-500' ON CONFLICT DO NOTHING;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('IAG-500', 'Inyección a Gasolina II', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 5, 6 FROM materias WHERE codigo = 'IAG-500' ON CONFLICT DO NOTHING;

  UPDATE materias_plan SET prerrequisito_id = (SELECT id FROM materias WHERE codigo = 'IAG-400') WHERE plan_estudio_id = v_plan_id AND materia_id = (SELECT id FROM materias WHERE codigo = 'IAG-500') AND prerrequisito_id IS NULL;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('LAD-500', 'Laboratorio Diése I', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 5, 4 FROM materias WHERE codigo = 'LAD-500' ON CONFLICT DO NOTHING;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('ETA-500', 'Electrónica Automotriz III', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 5, 6 FROM materias WHERE codigo = 'ETA-500' ON CONFLICT DO NOTHING;

  UPDATE materias_plan SET prerrequisito_id = (SELECT id FROM materias WHERE codigo = 'ETA-400') WHERE plan_estudio_id = v_plan_id AND materia_id = (SELECT id FROM materias WHERE codigo = 'ETA-500') AND prerrequisito_id IS NULL;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('NEU-500', 'Neumática', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 5, 2 FROM materias WHERE codigo = 'NEU-500' ON CONFLICT DO NOTHING;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('TRA-500', 'Transmisiones III', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 5, 4 FROM materias WHERE codigo = 'TRA-500' ON CONFLICT DO NOTHING;

  UPDATE materias_plan SET prerrequisito_id = (SELECT id FROM materias WHERE codigo = 'TRA-400') WHERE plan_estudio_id = v_plan_id AND materia_id = (SELECT id FROM materias WHERE codigo = 'TRA-500') AND prerrequisito_id IS NULL;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('TMG-500', 'Taller de Modalidad de Graduación I', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 5, 4 FROM materias WHERE codigo = 'TMG-500' ON CONFLICT DO NOTHING;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('IED-600', 'Inyección Electrónica Diése II', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 6, 4 FROM materias WHERE codigo = 'IED-600' ON CONFLICT DO NOTHING;

  UPDATE materias_plan SET prerrequisito_id = (SELECT id FROM materias WHERE codigo = 'IED-500') WHERE plan_estudio_id = v_plan_id AND materia_id = (SELECT id FROM materias WHERE codigo = 'IED-600') AND prerrequisito_id IS NULL;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('DAU-600', 'Diagnóstico del Automóvil', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 6, 4 FROM materias WHERE codigo = 'DAU-600' ON CONFLICT DO NOTHING;

  UPDATE materias_plan SET prerrequisito_id = (SELECT id FROM materias WHERE codigo = 'IAG-500') WHERE plan_estudio_id = v_plan_id AND materia_id = (SELECT id FROM materias WHERE codigo = 'DAU-600') AND prerrequisito_id IS NULL;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('LAD-600', 'Laboratorio Diése II', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 6, 4 FROM materias WHERE codigo = 'LAD-600' ON CONFLICT DO NOTHING;

  UPDATE materias_plan SET prerrequisito_id = (SELECT id FROM materias WHERE codigo = 'LAD-500') WHERE plan_estudio_id = v_plan_id AND materia_id = (SELECT id FROM materias WHERE codigo = 'LAD-600') AND prerrequisito_id IS NULL;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('HID-600', 'Hidráulica', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 6, 2 FROM materias WHERE codigo = 'HID-600' ON CONFLICT DO NOTHING;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('MAP-600', 'Maquinaria Agrícola y Pesada', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 6, 4 FROM materias WHERE codigo = 'MAP-600' ON CONFLICT DO NOTHING;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('IAG-600', 'Inyección a Gasolina III', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 6, 4 FROM materias WHERE codigo = 'IAG-600' ON CONFLICT DO NOTHING;

  UPDATE materias_plan SET prerrequisito_id = (SELECT id FROM materias WHERE codigo = 'IAG-500') WHERE plan_estudio_id = v_plan_id AND materia_id = (SELECT id FROM materias WHERE codigo = 'IAG-600') AND prerrequisito_id IS NULL;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('TRA-600', 'Transmisiones IV', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 6, 4 FROM materias WHERE codigo = 'TRA-600' ON CONFLICT DO NOTHING;

  UPDATE materias_plan SET prerrequisito_id = (SELECT id FROM materias WHERE codigo = 'TRA-500') WHERE plan_estudio_id = v_plan_id AND materia_id = (SELECT id FROM materias WHERE codigo = 'TRA-600') AND prerrequisito_id IS NULL;

  INSERT INTO materias (codigo, nombre, creado_en, actualizado_en) VALUES ('TMG-600', 'Taller de Modalidad de Graduación II', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (codigo) DO NOTHING;
  INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales) SELECT v_plan_id, id, 6, 4 FROM materias WHERE codigo = 'TMG-600' ON CONFLICT DO NOTHING;

  UPDATE materias_plan SET prerrequisito_id = (SELECT id FROM materias WHERE codigo = 'TMG-500') WHERE plan_estudio_id = v_plan_id AND materia_id = (SELECT id FROM materias WHERE codigo = 'TMG-600') AND prerrequisito_id IS NULL;

END $$;