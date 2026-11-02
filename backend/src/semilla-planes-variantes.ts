import 'reflect-metadata';
import { DataSource } from 'typeorm';
import {
  MATERIAS_VARIANTES,
  MATERIAS_VARIANTES_POR_PLAN,
  PLANES_VARIANTES,
} from './datos/planes-variantes';

/**
 * Semilla: planes de estudio VARIANTES con sus materias.
 *
 * Crea una variante por plan base, manteniendo la misma estructura académica:
 * mismas materias por semestre y mismas horas semanales (30 h por semestre),
 * pero con materias propias y orientadas a una especialidad.
 *
 *   Autotrónica (base 6-7-6-6-7-7)
 *     - Autotrónica Electrónica
 *     - Autotrónica Híbridos
 *
 *   Mecánica Automotriz (base 7-6-6-6-7-8)
 *     - Mecánica Automotriz Diesel
 *     - Mecánica Automotriz Servicio
 *
 * Requiere las carreras: ejecuta antes `npm run semilla:carreras`.
 *
 * Es idempotente: no duplica planes, materias ni asignaciones.
 *
 * Uso: npm run semilla:planes-variantes
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

async function sembrarPlanesVariantes() {
  console.log('=== Semilla: Planes de estudio variantes ===');

  await fuenteDatos.initialize();
  console.log('✓ Conexión a BD establecida');

  const ejecutor = fuenteDatos.createQueryRunner();
  await ejecutor.startTransaction();

  let planesCreados = 0;
  let planesExistentes = 0;
  let materiasCreadas = 0;
  let materiasExistentes = 0;
  let asignacionesCreadas = 0;
  let asignacionesExistentes = 0;
  const advertencias: string[] = [];

  try {
    // 1) Carreras indexadas por nombre normalizado
    const carreras: any[] = await ejecutor.query(`SELECT id, nombre FROM carreras`);
    const carreraPorNombre = new Map<string, number>();
    carreras.forEach((c) => carreraPorNombre.set(normalizar(c.nombre), c.id));

    if (carreraPorNombre.size === 0) {
      throw new Error(
        'No hay carreras registradas. Ejecuta primero: npm run semilla:carreras',
      );
    }

    // 2) Planes variantes
    const idPlanPorNombre = new Map<string, number>();

    for (const plan of PLANES_VARIANTES) {
      const carreraId = carreraPorNombre.get(normalizar(plan.carrera));
      if (!carreraId) {
        advertencias.push(
          `Plan "${plan.nombre}": la carrera "${plan.carrera}" no existe — omitido`,
        );
        continue;
      }

      const existente: any[] = await ejecutor.query(
        `SELECT id FROM planes_estudio WHERE numero_rm = $1`,
        [plan.numeroRm]
      );

      if (existente.length > 0) {
        idPlanPorNombre.set(plan.nombre, existente[0].id);
        planesExistentes++;
        console.log(`  - Ya existe: ${plan.nombre} (${plan.numeroRm})`);
        continue;
      }

      const insertado: any[] = await ejecutor.query(
        `INSERT INTO planes_estudio (carrera_id, numero_rm, fecha_rm, estado, notas)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [carreraId, plan.numeroRm, plan.fechaRm, plan.estado, plan.notas]
      );
      idPlanPorNombre.set(plan.nombre, insertado[0].id);
      planesCreados++;
      console.log(`  ✓ Plan creado: ${plan.nombre} (${plan.numeroRm})`);
    }

    // 3) Materias nuevas de las variantes
    const idPorCodigo = new Map<string, number>();

    for (const materia of MATERIAS_VARIANTES) {
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

    // 4) Asignación a los planes (semestre, horas y prerrequisito)
    const sinPrerrequisito = MATERIAS_VARIANTES_POR_PLAN.filter((m) => !m.prerrequisito);
    const conPrerrequisito = MATERIAS_VARIANTES_POR_PLAN.filter((m) => m.prerrequisito);

    for (const item of [...sinPrerrequisito, ...conPrerrequisito]) {
      const planId = idPlanPorNombre.get(item.plan);
      if (!planId) {
        advertencias.push(
          `${item.codigo}: el plan "${item.plan}" no existe — omitida`,
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
    console.log(`Planes creados:           ${planesCreados}`);
    console.log(`Planes ya existentes:     ${planesExistentes}`);
    console.log(`Materias creadas:         ${materiasCreadas}`);
    console.log(`Materias ya existentes:   ${materiasExistentes}`);
    console.log(`Asignaciones creadas:     ${asignacionesCreadas}`);
    console.log(`Asignaciones ya existentes: ${asignacionesExistentes}`);
    if (advertencias.length > 0) {
      console.log(`\nAdvertencias (${advertencias.length}):`);
      advertencias.forEach((a) => console.log('  - ' + a));
    }
    console.log('\n=== Semilla de planes variantes completada ===');
  } catch (error) {
    await ejecutor.rollbackTransaction();
    throw error;
  } finally {
    await ejecutor.release();
    await fuenteDatos.destroy();
  }
}

sembrarPlanesVariantes().catch((error) => {
  console.error('Error en semilla de planes variantes:', error);
  process.exit(1);
});
