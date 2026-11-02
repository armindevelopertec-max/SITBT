import 'reflect-metadata';
import { DataSource } from 'typeorm';

/**
 * Semilla: carreras y planes de estudio.
 *
 * Sin carreras y planes vigentes no se puede registrar ni sembrar ningún
 * estudiante (el estudiante exige `carrera_id` y `plan_estudio_id`).
 * Es idempotente: no duplica ni sobrescribe lo que ya existe.
 *
 * Uso: npm run semilla:carreras
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

interface CarreraSemilla {
  codigo: string;
  nombre: string;
  area: string;
  titulo: string;
  descripcion: string;
  horasCarga: number;
}

interface PlanSemilla {
  /** Código de la carrera a la que pertenece el plan. */
  carrera: string;
  numeroRm: string;
  fechaRm: string;
  notas: string;
}

const CARRERAS: CarreraSemilla[] = [
  {
    codigo: 'AU',
    nombre: 'Autotrónica',
    area: 'Tecnología',
    titulo: 'Técnico en Autotrónica',
    descripcion:
      'Formación técnica en diagnóstico, mantenimiento y reparación de los sistemas ' +
      'eléctricos, electrónicos y mecánicos del automóvil, con énfasis en vehículos ' +
      'de inyección electrónica e híbridos.',
    horasCarga: 3600,
  },
  {
    codigo: 'ME',
    nombre: 'Mecánica Automotriz',
    area: 'Tecnología',
    titulo: 'Técnico en Mecánica Automotriz',
    descripcion:
      'Formación técnica en mantenimiento y reparación de motores a gasolina y diésel, ' +
      'transmisiones, sistemas de inyección y electrónica automotriz, con prácticas de ' +
      'taller especializado.',
    horasCarga: 3600,
  },
];

const PLANES: PlanSemilla[] = [
  {
    carrera: 'AU',
    numeroRm: '1049/2023',
    fechaRm: '2023-01-01',
    notas: 'Plan AUT - Autotrónica',
  },
  {
    carrera: 'ME',
    numeroRm: '0210/2023',
    fechaRm: '2023-01-01',
    notas: 'Plan MEC - Mecánica Automotriz',
  },
];

async function sembrarCarreras() {
  console.log('=== Semilla: Carreras y planes de estudio ===');

  await fuenteDatos.initialize();
  console.log('✓ Conexión a BD establecida');

  const ejecutor = fuenteDatos.createQueryRunner();
  await ejecutor.startTransaction();

  let carrerasCreadas = 0;
  let planesCreados = 0;

  try {
    // 1) Carreras
    for (const carrera of CARRERAS) {
      const existente: any[] = await ejecutor.query(
        `SELECT id FROM carreras WHERE codigo = $1`,
        [carrera.codigo]
      );

      if (existente.length > 0) {
        console.log(`  - Ya existe: ${carrera.nombre} (${carrera.codigo})`);
        continue;
      }

      await ejecutor.query(
        `INSERT INTO carreras (codigo, nombre, area, titulo, descripcion, horas_carga, estado)
         VALUES ($1, $2, $3, $4, $5, $6, 'activo')`,
        [
          carrera.codigo,
          carrera.nombre,
          carrera.area,
          carrera.titulo,
          carrera.descripcion,
          carrera.horasCarga,
        ]
      );
      console.log(`  ✓ Carrera creada: ${carrera.nombre} (${carrera.codigo})`);
      carrerasCreadas++;
    }

    // 2) Planes de estudio (uno vigente por carrera)
    for (const plan of PLANES) {
      const carrera: any[] = await ejecutor.query(
        `SELECT id FROM carreras WHERE codigo = $1`,
        [plan.carrera]
      );
      if (carrera.length === 0) {
        console.log(`  ! Carrera "${plan.carrera}" no encontrada: plan omitido`);
        continue;
      }

      const planExistente: any[] = await ejecutor.query(
        `SELECT id FROM planes_estudio WHERE carrera_id = $1 AND numero_rm = $2`,
        [carrera[0].id, plan.numeroRm]
      );

      if (planExistente.length > 0) {
        console.log(`  - Ya existe: plan ${plan.numeroRm} (${plan.carrera})`);
        continue;
      }

      await ejecutor.query(
        `INSERT INTO planes_estudio (carrera_id, numero_rm, fecha_rm, estado, notas)
         VALUES ($1, $2, $3, 'vigente', $4)`,
        [carrera[0].id, plan.numeroRm, plan.fechaRm, plan.notas]
      );
      console.log(`  ✓ Plan creado: ${plan.numeroRm} (${plan.carrera})`);
      planesCreados++;
    }

    await ejecutor.commitTransaction();

    console.log('\n=== Resumen ===');
    console.log(`Carreras creadas: ${carrerasCreadas}`);
    console.log(`Planes creados:   ${planesCreados}`);
    console.log('\n=== Semilla de carreras completada ===');
  } catch (error) {
    await ejecutor.rollbackTransaction();
    throw error;
  } finally {
    await ejecutor.release();
    await fuenteDatos.destroy();
  }
}

sembrarCarreras().catch((error) => {
  console.error('Error en semilla de carreras:', error);
  process.exit(1);
});
