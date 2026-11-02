import 'reflect-metadata';
import { DataSource } from 'typeorm';

/**
 * Semilla: conceptos de pago.
 *
 * Sin conceptos de pago la verificación de pagos de la preinscripción no
 * puede detectar lo que falta: si no hay conceptos, `pagosFaltantes` queda
 * vacío y el sistema informa "pagos al día" aunque el estudiante no haya
 * pagado nada.
 *
 * Datos tomados del respaldo `backups/completo_20261101_130109/bd_sitbt.sql.gz`
 * (tabla `conceptos_pago`), que tenía el concepto de Matrícula. Se añade
 * además el concepto semestral, necesario para el cobro por período.
 *
 * Es idempotente: no duplica conceptos.
 *
 * Uso: npm run semilla:conceptos-pago
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

interface ConceptoSemilla {
  codigo: string;
  nombre: string;
  /** 'unico' se cobra una sola vez; 'semestral' en cada período. */
  tipo: 'unico' | 'semestral';
  montoPredeterminado: number;
  descripcion: string;
}

const CONCEPTOS: ConceptoSemilla[] = [
  {
    codigo: 'MAT',
    nombre: 'Matrícula',
    tipo: 'unico',
    montoPredeterminado: 150,
    descripcion: 'Pago único de matrícula e inscripción al institute.',
  },
  {
    codigo: 'SEM',
    nombre: 'Matrícula semestral',
    tipo: 'semestral',
    montoPredeterminado: 150,
    descripcion: 'Pago por período académico (semestre).',
  },
];

async function sembrarConceptosPago() {
  console.log('=== Semilla: Conceptos de pago ===');

  await fuenteDatos.initialize();
  console.log('✓ Conexión a BD establecida');

  const ejecutor = fuenteDatos.createQueryRunner();
  await ejecutor.startTransaction();

  let creados = 0;
  let existentes = 0;

  try {
    for (const concepto of CONCEPTOS) {
      const existente: any[] = await ejecutor.query(
        `SELECT id FROM conceptos_pago WHERE codigo = $1`,
        [concepto.codigo]
      );

      if (existente.length > 0) {
        existentes++;
        console.log(`  - Ya existe: ${concepto.nombre} (${concepto.codigo})`);
        continue;
      }

      await ejecutor.query(
        `INSERT INTO conceptos_pago (codigo, nombre, tipo, monto_predeterminado, descripcion, estado)
         VALUES ($1, $2, $3, $4, $5, 'activo')`,
        [
          concepto.codigo,
          concepto.nombre,
          concepto.tipo,
          concepto.montoPredeterminado,
          concepto.descripcion,
        ]
      );
      console.log(
        `  ✓ Concepto creado: ${concepto.nombre} (${concepto.codigo}) — ${concepto.tipo} — Bs ${concepto.montoPredeterminado}`,
      );
      creados++;
    }

    await ejecutor.commitTransaction();

    console.log('\n=== Resumen ===');
    console.log(`Conceptos creados:       ${creados}`);
    console.log(`Conceptos ya existentes: ${existentes}`);
    console.log('\n=== Semilla de conceptos de pago completada ===');
  } catch (error) {
    await ejecutor.rollbackTransaction();
    throw error;
  } finally {
    await ejecutor.release();
    await fuenteDatos.destroy();
  }
}

sembrarConceptosPago().catch((error) => {
  console.error('Error en semilla de conceptos de pago:', error);
  process.exit(1);
});
