import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { MATERIAS, MATERIAS_POR_PLAN } from './datos/materias-backup';

/**
 * Semilla: materias y materias por plan de estudio.
 *
 * Las materias provienen del respaldo
 * `backups/completo_20261101_130109/bd_sitbt.sql.gz`:
 *  - 71 materias (código y nombre) de las tablas `materias`.
 *  - 79 asignaciones de la tabla `materias_plan` (plan, semestre, horas
 *    semanales y prerrequisito) para los dos planes vigentes:
 *    Autotrónica (39 materias) y Mecánica Automotriz (40 materias).
 *
 * Requiere las carreras y planes de estudio: ejecuta antes
 * `npm run semilla:carreras`.
 *
 * Es idempotente: no duplica materias ni asignaciones.
 *
 * Uso: npm run semilla:materias
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

function normalizar(texto: string): string {
  return (texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();
}

async function sembrarMaterias() {
  console.log('=== Semilla: Materias y materias por plan ===');

  await fuenteDatos.initialize();
  console.log('✓ Conexión a BD establecida');

  const ejecutor = fuenteDatos.createQueryRunner();
  await ejecutor.startTransaction();

  let materiasCreadas = 0;
  let materiasExistentes = 0;
  let asignacionesCreadas = 0;
  let asignacionesExistentes = 0;
  const advertencias: string[] = [];

  try {
    // 1) Planes de estudio vigentes, indexados por nombre de carrera
    const planes: any[] = await ejecutor.query(
      `SELECT p.id, p.numero_rm, c.nombre AS carrera
       FROM planes_estudio p JOIN carreras c ON c.id = p.carrera_id
       WHERE p.estado = 'vigente'`
    );
    const planPorCarrera = new Map<string, number>();
    planes.forEach((p) => planPorCarrera.set(normalizar(p.carrera), p.id));

    if (planPorCarrera.size === 0) {
      throw new Error(
        'No hay planes de estudio vigentes. Ejecuta primero: npm run semilla:carreras',
      );
    }

    // 2) Materias (catálogo general)
    const idPorCodigo = new Map<string, number>();

    for (const materia of MATERIAS) {
      const existente: any[] = await ejecutor.query(
        `SELECT id FROM materias WHERE codigo = $1`,
        [materia.codigo]
      );

      if (existente.length > 0) {
        idPorCodigo.set(materia.codigo, existente[0].id);
        materiasExistentes++;
        continue;
      }

      const insertada: any[] = await ejecutor.query(
        `INSERT INTO materias (codigo, nombre) VALUES ($1, $2) RETURNING id`,
        [materia.codigo, materia.nombre]
      );
      idPorCodigo.set(materia.codigo, insertada[0].id);
      materiasCreadas++;
    }

    console.log(
      `  ✓ Materias: ${materiasCreadas} creadas, ${materiasExistentes} ya existentes`,
    );

    // 3) Materias por plan (semestre, horas y prerrequisito)
    //    Se resuelven los prerrequisitos en dos pasadas: primero todas las
    //    materias y luego las que tienen prerrequisito.
    const sinPrerrequisito = MATERIAS_POR_PLAN.filter((m) => !m.prerrequisito);
    const conPrerrequisito = MATERIAS_POR_PLAN.filter((m) => m.prerrequisito);

    for (const item of [...sinPrerrequisito, ...conPrerrequisito]) {
      const planId = planPorCarrera.get(normalizar(item.plan));
      if (!planId) {
        advertencias.push(
          `${item.codigo}: no hay plan vigente para "${item.plan}" — omitida`,
        );
        continue;
      }

      const materiaId = idPorCodigo.get(item.codigo);
      if (!materiaId) {
        advertencias.push(
          `${item.codigo}: la materia no existe en el catálogo — omitida`,
        );
        continue;
      }

      let prerrequisitoId: number | null = null;
      if (item.prerrequisito) {
        prerrequisitoId = idPorCodigo.get(item.prerrequisito) ?? null;
        if (!prerrequisitoId) {
          advertencias.push(
            `${item.codigo}: prerrequisito "${item.prerrequisito}" no encontrado — se deja sin prerrequisito`,
          );
        }
      }

      const existente: any[] = await ejecutor.query(
        `SELECT id FROM materias_plan
         WHERE plan_estudio_id = $1 AND materia_id = $2`,
        [planId, materiaId]
      );

      if (existente.length > 0) {
        asignacionesExistentes++;
        continue;
      }

      await ejecutor.query(
        `INSERT INTO materias_plan (plan_estudio_id, materia_id, semestre, horas_semanales, prerrequisito_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [planId, materiaId, item.semestre, item.horasSemanales, prerrequisitoId]
      );
      asignacionesCreadas++;
    }

    await ejecutor.commitTransaction();

    console.log('\n=== Resumen ===');
    console.log(`Materias creadas:          ${materiasCreadas}`);
    console.log(`Materias ya existentes:    ${materiasExistentes}`);
    console.log(`Asignaciones creadas:      ${asignacionesCreadas}`);
    console.log(`Asignaciones ya existentes: ${asignacionesExistentes}`);
    if (advertencias.length > 0) {
      console.log(`\nAdvertencias (${advertencias.length}):`);
      advertencias.forEach((a) => console.log('  - ' + a));
    }
    console.log('\n=== Semilla de materias completada ===');
  } catch (error) {
    await ejecutor.rollbackTransaction();
    throw error;
  } finally {
    await ejecutor.release();
    await fuenteDatos.destroy();
  }
}

sembrarMaterias().catch((error) => {
  console.error('Error en semilla de materias:', error);
  process.exit(1);
});
