import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

/**
 * Semilla de docentes.
 *
 * Inserta únicamente los docentes que estaban registrados en el respaldo
 * `backups/completo_20261101_130109/bd_sitbt.sql.gz` (personas 5 a 10 y
 * personal 3 a 8). No inserta estudiantes ni otras personas.
 *
 * También crea el usuario de cada docente con el mismo formato que usa el
 * alta de personal desde la aplicación: `doc_<CI>` / `<CI>-<año actual>`.
 *
 * El rol `docente` no se crea aquí. Si ya existe y está activo se asigna
 * automáticamente; si no, los usuarios quedan sin rol para que el
 * administrador los asigne desde /usuarios.
 *
 * Uso: npm run semilla:docentes
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

interface DocenteSemilla {
  ci: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  /** Especialidad / carrera a la que pertenece el docente. */
  area: string;
  /** Grado académico: 'Técnico Superior' | 'Licenciado' | ... */
  grado: string;
  genero: 'M' | 'F';
  /** La tabla 'personas' exige fecha no nula; ver nota más abajo. */
  fechaNacimiento: string;
}

// NOTA: fecha_nacimiento es obligatoria en 'personas' y los datos de origen no la
// traían. Se usa un valor provisional; reemplázalo por el real cuando lo tengas.
const FECHA_NACIMIENTO_PROVISIONAL = '1985-01-01';

const DOCENTES: DocenteSemilla[] = [
  { ci: '12391896', nombres: 'Geobany Israel', apellidoPaterno: 'Condori', apellidoMaterno: 'Mamani',   area: 'Mecánica Automotriz', grado: 'Técnico Superior', genero: 'M', fechaNacimiento: FECHA_NACIMIENTO_PROVISIONAL },
  { ci: '7073822',  nombres: 'Mauricio',       apellidoPaterno: 'Quispe',  apellidoMaterno: 'Intimayta', area: 'Mecánica Automotriz', grado: 'Técnico Superior', genero: 'M', fechaNacimiento: FECHA_NACIMIENTO_PROVISIONAL },
  { ci: '8302164',  nombres: 'Rolando',        apellidoPaterno: 'Huanaco', apellidoMaterno: 'Flores',   area: 'Mecánica Automotriz', grado: 'Técnico Superior', genero: 'M', fechaNacimiento: FECHA_NACIMIENTO_PROVISIONAL },
  { ci: '12572834', nombres: 'Wilfredo',       apellidoPaterno: 'Quenta',  apellidoMaterno: 'Apaza',    area: 'Mecánica Automotriz', grado: 'Técnico Superior', genero: 'M', fechaNacimiento: FECHA_NACIMIENTO_PROVISIONAL },
  { ci: '6163428',  nombres: 'Willy',          apellidoPaterno: 'Quispe',  apellidoMaterno: 'Surco',    area: 'Mecánica Automotriz', grado: 'Licenciado',       genero: 'M', fechaNacimiento: FECHA_NACIMIENTO_PROVISIONAL },
  { ci: '7064275',  nombres: 'Yhonny Ivan',    apellidoPaterno: 'Condori', apellidoMaterno: 'Mita',     area: 'Mecánica Automotriz', grado: 'Licenciado',       genero: 'M', fechaNacimiento: FECHA_NACIMIENTO_PROVISIONAL },
];

async function sembrarDocentes() {
  console.log('=== Semilla: Docentes ===');

  await fuenteDatos.initialize();
  console.log('✓ Conexión a BD establecida');

  const anioActual = new Date().getFullYear().toString();
  const fechaContrato = `${anioActual}-02-01`;
  const ejecutorConsultas = fuenteDatos.createQueryRunner();
  await ejecutorConsultas.startTransaction();

  let creados = 0;
  let existentes = 0;

  try {
    // El rol NO se crea aquí: el administrador lo crea desde /roles.
    // Si ya existe y está activo, se asigna a los docentes.
    const rolDocente: any[] = await ejecutorConsultas.query(
      `SELECT id FROM roles WHERE codigo = 'docente' AND estado = 'activo'`
    );
    const idRolDocente: number | null = rolDocente.length > 0 ? rolDocente[0].id : null;
    if (idRolDocente === null) {
      console.warn(
        "  ! No existe el rol activo 'docente': los docentes se crearán SIN rol."
      );
      console.warn("    Créalo desde /roles y asígnalo desde /usuarios.");
    }

    for (const docente of DOCENTES) {
      const nombreCompleto = `${docente.apellidoPaterno} ${docente.apellidoMaterno}, ${docente.nombres}`;
      const profesion = `${docente.grado} en ${docente.area}`;

      // 1) Persona (buscar por CI, crear si no existe)
      let idPersona: number;
      const personaExistente: any[] = await ejecutorConsultas.query(
        `SELECT id FROM personas WHERE ci = $1`,
        [docente.ci]
      );
      if (personaExistente.length > 0) {
        idPersona = personaExistente[0].id;
      } else {
        const insertada: any[] = await ejecutorConsultas.query(
          `INSERT INTO personas (ci, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, genero, nacionalidad, estado)
           VALUES ($1, $2, $3, $4, $5, $6, 'Boliviana', 'activo')
           RETURNING id`,
          [
            docente.ci,
            docente.nombres,
            docente.apellidoPaterno,
            docente.apellidoMaterno,
            docente.fechaNacimiento,
            docente.genero,
          ]
        );
        idPersona = insertada[0].id;
      }

      // 2) Personal (buscar por personaId, crear si no existe)
      const personalExistente: any[] = await ejecutorConsultas.query(
        `SELECT id FROM personal WHERE "personaId" = $1`,
        [idPersona]
      );
      if (personalExistente.length > 0) {
        console.log(`  - Ya existe: ${nombreCompleto} (CI ${docente.ci})`);
        existentes++;
      } else {
        await ejecutorConsultas.query(
          `INSERT INTO personal ("personaId", profesion, cargo, fecha_contrato, estado)
           VALUES ($1, $2, 'docente', $3, 'activo')`,
          [idPersona, profesion, fechaContrato]
        );
        console.log(`  ✓ Docente creado: ${nombreCompleto} (CI ${docente.ci}) — ${profesion}`);
        creados++;
      }

      // 3) Usuario + rol (igual que el alta de personal desde la app)
      const usuarioExistente: any[] = await ejecutorConsultas.query(
        `SELECT id FROM usuarios WHERE "personaId" = $1`,
        [idPersona]
      );
      let idUsuario: number;
      if (usuarioExistente.length > 0) {
        idUsuario = usuarioExistente[0].id;
      } else {
        const nombreUsuario = `doc_${docente.ci.replace(/[^a-zA-Z0-9]/g, '')}`;
        const contrasena = `${docente.ci}-${anioActual}`;
        const hashContrasena = await bcrypt.hash(contrasena, 10);
        const usuarioInsertado: any[] = await ejecutorConsultas.query(
          `INSERT INTO usuarios ("personaId", nombre_usuario, contrasena_hash, estado)
           VALUES ($1, $2, $3, 'activo')
           RETURNING id`,
          [idPersona, nombreUsuario, hashContrasena]
        );
        idUsuario = usuarioInsertado[0].id;
        console.log(`      ↳ Usuario: ${nombreUsuario} / ${contrasena}`);
      }

      if (idRolDocente !== null) {
        const rolAsignado: any[] = await ejecutorConsultas.query(
          `SELECT id FROM usuario_roles WHERE usuario_id = $1 AND rol_id = $2`,
          [idUsuario, idRolDocente]
        );
        if (rolAsignado.length === 0) {
          await ejecutorConsultas.query(
            `INSERT INTO usuario_roles (usuario_id, rol_id) VALUES ($1, $2)`,
            [idUsuario, idRolDocente]
          );
          console.log(`      ↳ Rol asignado: docente`);
        }
      }
    }

    await ejecutorConsultas.commitTransaction();

    console.log('\n=== Resumen ===');
    console.log(`Docentes creados: ${creados}`);
    console.log(`Docentes ya existentes: ${existentes}`);
    console.log(`Acceso de docentes: usuario doc_<CI> / contraseña <CI>-${anioActual}`);
    if (idRolDocente === null) {
      console.log("Roles asignados: ninguno (falta crear el rol 'docente' desde /roles)");
    } else {
      console.log("Roles asignados: docente");
    }
    console.log('\n=== Semilla de docentes completada ===');
  } catch (error) {
    await ejecutorConsultas.rollbackTransaction();
    throw error;
  } finally {
    await ejecutorConsultas.release();
    await fuenteDatos.destroy();
  }
}

sembrarDocentes().catch((error) => {
  console.error('Error en semilla de docentes:', error);
  process.exit(1);
});
