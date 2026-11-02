import 'reflect-metadata';
import { DataSource } from 'typeorm';

/**
 * Semilla: gestiones académicas y sus periodos.
 *
 * Datos tomados del respaldo `backups/completo_20261101_130109/bd_sitbt.sql.gz`
 * (tablas `gestiones` y `periodos`):
 *
 *   2026  semestral  abierta   actual   (periodo I cerrado, periodo II abierta)
 *   2027  semestral  cerrada
 *   2028  semestral  cerrada
 *
 * Sin una gestión no se pueden crear grupos, períodos de pago ni inscripciones,
 * por eso es una de las semillas base del sistema.
 *
 * Es idempotente: no duplica gestiones ni periodos.
 *
 * Uso: npm run semilla:gestiones
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

interface GestionSemilla {
  anio: string;
  tipoPeriodo: 'semestral';
  estado: 'abierta' | 'cerrada' | 'pendiente';
  esActual: boolean;
  notas: string;
  periodos: PeriodoSemilla[];
}

interface PeriodoSemilla {
  numero: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  estado: 'abierta' | 'cerrada' | 'pendiente';
}

const GESTIONES: GestionSemilla[] = [
  {
    anio: '2026',
    tipoPeriodo: 'semestral',
    estado: 'abierta',
    esActual: true,
    notas: 'Gestion 2026',
    periodos: [
      {
        numero: 'I',
        nombre: 'Primer Semestre',
        fechaInicio: '2026-02-20',
        fechaFin: '2026-07-10',
        estado: 'cerrada',
      },
      {
        numero: 'II',
        nombre: 'Segundo Semestre',
        fechaInicio: '2026-07-20',
        fechaFin: '2026-12-11',
        estado: 'abierta',
      },
    ],
  },
  {
    anio: '2027',
    tipoPeriodo: 'semestral',
    estado: 'cerrada',
    esActual: false,
    notas: 'Gestion 2027',
    periodos: [
      {
        numero: 'I',
        nombre: 'Primer Semestre',
        fechaInicio: '2027-02-20',
        fechaFin: '2027-07-10',
        estado: 'pendiente',
      },
      {
        numero: 'II',
        nombre: 'Segundo Semestre',
        fechaInicio: '2027-07-20',
        fechaFin: '2027-12-11',
        estado: 'pendiente',
      },
    ],
  },
  {
    anio: '2028',
    tipoPeriodo: 'semestral',
    estado: 'cerrada',
    esActual: false,
    notas: 'Gestion 2028',
    periodos: [
      {
        numero: 'I',
        nombre: 'Primer Semestre',
        fechaInicio: '2028-02-20',
        fechaFin: '2028-07-10',
        estado: 'pendiente',
      },
      {
        numero: 'II',
        nombre: 'Segundo Semestre',
        fechaInicio: '2028-07-20',
        fechaFin: '2028-12-11',
        estado: 'pendiente',
      },
    ],
  },
];

async function sembrarGestiones() {
  console.log('=== Semilla: Gestiones académicas y periodos ===');

  await fuenteDatos.initialize();
  console.log('✓ Conexión a BD establecida');

  const ejecutor = fuenteDatos.createQueryRunner();
  await ejecutor.startTransaction();

  let gestionesCreadas = 0;
  let gestionesExistentes = 0;
  let periodosCreados = 0;
  let periodosExistentes = 0;

  try {
    for (const gestion of GESTIONES) {
      const existente: any[] = await ejecutor.query(
        `SELECT id FROM gestiones WHERE anio = $1`,
        [gestion.anio]
      );

      let idGestion: number;

      if (existente.length > 0) {
        idGestion = existente[0].id;
        gestionesExistentes++;
        console.log(`  - Ya existe: gestión ${gestion.anio}`);
      } else {
        const insertada: any[] = await ejecutor.query(
          `INSERT INTO gestiones (anio, tipo_periodo, estado, es_actual, notas)
           VALUES ($1, $2, $3, $4, $5) RETURNING id`,
          [
            gestion.anio,
            gestion.tipoPeriodo,
            gestion.estado,
            gestion.esActual,
            gestion.notas,
          ]
        );
        idGestion = insertada[0].id;
        gestionesCreadas++;
        console.log(`  ✓ Gestión creada: ${gestion.anio} (${gestion.estado})`);
      }

      // Periodos de la gestión
      for (const periodo of gestion.periodos) {
        const periodoExistente: any[] = await ejecutor.query(
          `SELECT id FROM periodos WHERE "gestionId" = $1 AND numero = $2`,
          [idGestion, periodo.numero]
        );

        if (periodoExistente.length > 0) {
          periodosExistentes++;
          console.log(`    - Ya existe: periodo ${periodo.numero}`);
          continue;
        }

        await ejecutor.query(
          `INSERT INTO periodos ("gestionId", numero, nombre, fecha_inicio, fecha_fin, estado)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            idGestion,
            periodo.numero,
            periodo.nombre,
            periodo.fechaInicio,
            periodo.fechaFin,
            periodo.estado,
          ]
        );
        periodosCreados++;
        console.log(
          `    ✓ Periodo creado: ${periodo.numero} (${periodo.fechaInicio} → ${periodo.fechaFin}) — ${periodo.estado}`,
        );
      }
    }

    await ejecutor.commitTransaction();

    console.log('\n=== Resumen ===');
    console.log(`Gestiones creadas:      ${gestionesCreadas}`);
    console.log(`Gestiones ya existentes: ${gestionesExistentes}`);
    console.log(`Periodos creados:       ${periodosCreados}`);
    console.log(`Periodos ya existentes: ${periodosExistentes}`);
    console.log('\n=== Semilla de gestiones completada ===');
  } catch (error) {
    await ejecutor.rollbackTransaction();
    throw error;
  } finally {
    await ejecutor.release();
    await fuenteDatos.destroy();
  }
}

sembrarGestiones().catch((error) => {
  console.error('Error en semilla de gestiones:', error);
  process.exit(1);
});
