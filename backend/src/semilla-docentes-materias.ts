import 'reflect-metadata';
import { DataSource } from 'typeorm';

/**
 * Semilla: asignación de docentes a las materias impartidas.
 *
 * Los docentes imparten en ambas carreras, así que se reparten las materias
 * impartidas de los grupos con estudiantes inscritos:
 *
 *  - En cada TURNO un docente da como máximo una materia, para que no tenga
 *    clases simultáneas en el mismo horario.
 *  - La carga se equilibra: se recorre cada turno de cada carrera y se
 *    asigna al docente con menos horas acumuladas.
 *  - La carga horaria de cada asignación es la de la materia en la malla.
 *
 * Es idempotente: no duplica asignaciones. Las que ya existen (con otro
 * docente) se respetan y no se modifican.
 *
 * Uso: npm run semilla:docentes-materias
 */
const fuenteDatos = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5434'),
  username: process.env.DB_USERNAME || 'sitbt',
  password: process.env.DB_PASSWORD || 'sitbt_password',
  database: process.env.DB_DATABASE || 'sitbt_db',
  synchronize: false,
});

async function sembrarDocentesMaterias() {
  console.log('=== Semilla: Docentes en las materias impartidas ===');

  await fuenteDatos.initialize();
  console.log('✓ Conexión a BD establecida');

  const ejecutor = fuenteDatos.createQueryRunner();
  await ejecutor.startTransaction();

  let creadas = 0;
  let existentes = 0;
  let sinDocente = 0;

  try {
    // 1) Docentes activos
    const docentes: any[] = await ejecutor.query(
      `SELECT p.id FROM personal p WHERE p.cargo = 'docente' AND p.estado = 'activo' ORDER BY p.id`
    );

    if (docentes.length === 0) {
      throw new Error(
        'No hay docentes activos. Ejecuta primero: npm run semilla:docentes'
      );
    }
    console.log(`  → ${docentes.length} docente(s) activo(s)`);

    // 2) Materias impartidas de los grupos con estudiantes inscritos
    const materias: any[] = await ejecutor.query(
      `SELECT mi.id,
              mi.materia_id,
              mi.grupo_id,
              mi.gestion,
              mi.periodo_id,
              m.codigo AS materia_codigo,
              mp.horas_semanales,
              g.codigo AS grupo_codigo,
              g.turno_id,
              g.semestre,
              g.carrera_id
       FROM materias_impartidas mi
       JOIN materias m ON m.id = mi.materia_id
       JOIN materias_plan mp ON mp.id = mi.materia_plan_id
       JOIN grupos g ON g.id = mi.grupo_id
       WHERE EXISTS (
         SELECT 1 FROM grupos_estudiantes ge WHERE ge.grupo_id = g.id
       )
       ORDER BY g.turno_id, g.semestre, m.codigo, g.codigo`
    );

    if (materias.length === 0) {
      console.log('  ! No hay materias impartidas con estudiantes inscritos.');
    }
    console.log(`  → ${materias.length} materia(s) impartida(s) con inscritos`);

    // 3) Asignaciones ya existentes
    const asignaciones: any[] = await ejecutor.query(
      `SELECT id, materia_impartida_id, docente_id
       FROM asignaciones_docentes
       WHERE estado = 'activo'`
    );

    const asignadasPorMateria = new Map<number, number>(
      asignaciones.map((a) => [a.materia_impartida_id, a.docente_id]),
    );

    // Carga horaria acumulada por docente
    const cargaPorDocente = new Map<number, number>(
      docentes.map((d) => [d.id, 0]),
    );
    for (const asignacion of asignaciones) {
      const materia = materias.find((m) => m.id === asignacion.materia_impartida_id);
      if (materia) {
        cargaPorDocente.set(
          asignacion.docente_id,
          (cargaPorDocente.get(asignacion.docente_id) ?? 0) + materia.horas_semanales,
        );
      }
    }

    // Materias ya asignadas: se respetan
    for (const materia of materias) {
      if (asignadasPorMateria.has(materia.id)) {
        existentes++;
      }
    }

    // 4) Asignación del resto
    // Se procesa turno por turno: dentro de un turno cada docente da una
    // sola materia, así no tiene clases simultáneas.
    const porTurno = new Map<number, any[]>();
    for (const materia of materias) {
      if (asignadasPorMateria.has(materia.id)) continue;
      const lista = porTurno.get(materia.turno_id) ?? [];
      lista.push(materia);
      porTurno.set(materia.turno_id, lista);
    }

    const hoy = new Date().toISOString().slice(0, 10);

    for (const [turnoId, lista] of [...porTurno.entries()].sort((a, b) => a[0] - b[0])) {
      // Docentes que ya tienen materia en este turno, sin importar el grupo:
      // un docente no puede dar dos clases a la vez en el mismo turno.
      const ocupadosEnTurno = new Set<number>();
      for (const materia of materias) {
        if (materia.turno_id !== turnoId) continue;
        const docenteId = asignadasPorMateria.get(materia.id);
        if (docenteId) ocupadosEnTurno.add(docenteId);
      }

      // Dentro del turno se ordenan las materias por grupo: así un docente
      // recibe primero las materias del grupo con más carga.
      lista.sort((a, b) => a.grupo_codigo.localeCompare(b.grupo_codigo));

      for (const materia of lista) {
        // Docente con menos carga y libre en este turno.
        const candidatos = docentes.filter(
          (d) => !ocupadosEnTurno.has(d.id)
        );
        const elegibles = candidatos.length > 0 ? candidatos : docentes;

        const docente = elegibles.reduce((mejor, actual) => {
          const cargaMejor = cargaPorDocente.get(mejor.id) ?? 0;
          const cargaActual = cargaPorDocente.get(actual.id) ?? 0;
          return cargaActual < cargaMejor ? actual : mejor;
        }, elegibles[0]);

        if (!docente) {
          sinDocente++;
          continue;
        }

        await ejecutor.query(
          `INSERT INTO asignaciones_docentes
             (docente_id, materia_id, grupo_id, materia_impartida_id, gestion,
              fecha_inicio, carga_horaria, observacion, estado)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'activo')`,
          [
            docente.id,
            materia.materia_id,
            materia.grupo_id,
            materia.id,
            materia.gestion,
            hoy,
            materia.horas_semanales,
            'Asignación automática por carga',
          ]
        );

        ocupadosEnTurno.add(docente.id);
        cargaPorDocente.set(
          docente.id,
          (cargaPorDocente.get(docente.id) ?? 0) + materia.horas_semanales,
        );
        creadas++;
      }
    }

    await ejecutor.commitTransaction();

    // Resumen por docente
    const resumen: any[] = await ejecutor.query(
      `SELECT p.id, pe.nombres || ' ' || pe.apellido_paterno AS nombre,
              COUNT(ad.id) AS materias,
              COALESCE(SUM(ad.carga_horaria), 0) AS horas
       FROM personal p
       JOIN personas pe ON pe.id = p."personaId"
       LEFT JOIN asignaciones_docentes ad
              ON ad.docente_id = p.id AND ad.estado = 'activo'
       WHERE p.cargo = 'docente' AND p.estado = 'activo'
       GROUP BY p.id, pe.nombres, pe.apellido_paterno
       ORDER BY p.id`
    );

    console.log('\n=== Resumen ===');
    console.log(`Asignaciones creadas: ${creadas}`);
    console.log(`Ya asignadas:        ${existentes}`);
    if (sinDocente > 0) {
      console.log(`Sin docente:          ${sinDocente}`);
    }

    console.log('\n=== Carga por docente ===');
    for (const fila of resumen) {
      console.log(
        `  ${fila.nombre.padEnd(28)} ${fila.materias} materia(s) · ${fila.horas} h/semana`
      );
    }

    console.log('\n=== Semilla de docentes en materias impartidas completada ===');
  } catch (error) {
    await ejecutor.rollbackTransaction();
    throw error;
  } finally {
    await ejecutor.release();
    await fuenteDatos.destroy();
  }
}

sembrarDocentesMaterias().catch((error) => {
  console.error('Error en semilla de docentes en materias impartidas:', error);
  process.exit(1);
});
