import 'reflect-metadata';
import { DataSource } from 'typeorm';

/**
 * Semilla: turnos.
 *
 * Sin turnos no se pueden crear grupos (cada grupo pertenece a un turno), y
 * la preinscripción no puede asignar grupo al estudiante.
 *
 * Datos tomados del respaldo `backups/completo_20261101_130109/bd_sitbt.sql.gz`
 * (tabla `turnos`).
 *
 * Es idempotente: no duplica turnos.
 *
 * Uso: npm run semilla:turnos
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

interface TurnoSemilla {
  codigo: string;
  nombre: string;
  horaInicio: string;
  horaFin: string;
}

const TURNOS: TurnoSemilla[] = [
  { codigo: 'MAÑANA', nombre: 'Turno Mañana', horaInicio: '07:00:00', horaFin: '12:00:00' },
  { codigo: 'TARDE', nombre: 'Turno Tarde', horaInicio: '14:00:00', horaFin: '18:00:00' },
  { codigo: 'NOCHE', nombre: 'Turno Noche', horaInicio: '19:00:00', horaFin: '22:00:00' },
];

async function sembrarTurnos() {
  console.log('=== Semilla: Turnos ===');

  await fuenteDatos.initialize();
  console.log('✓ Conexión a BD establecida');

  const ejecutor = fuenteDatos.createQueryRunner();
  await ejecutor.startTransaction();

  let creados = 0;
  let existentes = 0;

  try {
    for (const turno of TURNOS) {
      const existente: any[] = await ejecutor.query(
        `SELECT id FROM turnos WHERE codigo = $1`,
        [turno.codigo]
      );

      if (existente.length > 0) {
        existentes++;
        console.log(`  - Ya existe: ${turno.nombre} (${turno.codigo})`);
        continue;
      }

      await ejecutor.query(
        `INSERT INTO turnos (codigo, nombre, hora_inicio, hora_fin)
         VALUES ($1, $2, $3, $4)`,
        [turno.codigo, turno.nombre, turno.horaInicio, turno.horaFin]
      );
      console.log(
        `  ✓ Turno creado: ${turno.nombre} (${turno.horaInicio} → ${turno.horaFin})`,
      );
      creados++;
    }

    await ejecutor.commitTransaction();

    console.log('\n=== Resumen ===');
    console.log(`Turnos creados:       ${creados}`);
    console.log(`Turnos ya existentes: ${existentes}`);
    console.log('\n=== Semilla de turnos completada ===');
  } catch (error) {
    await ejecutor.rollbackTransaction();
    throw error;
  } finally {
    await ejecutor.release();
    await fuenteDatos.destroy();
  }
}

sembrarTurnos().catch((error) => {
  console.error('Error en semilla de turnos:', error);
  process.exit(1);
});
