import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

const fuenteDatos = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5434'),
  username: process.env.DB_USERNAME || 'sitbt',
  password: process.env.DB_PASSWORD || 'sitbt_password',
  database: process.env.DB_DATABASE || 'sitbt_db',
  synchronize: false,
});

enum EstadoUsuario {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
  BLOQUEADO = 'bloqueado',
}

async function generarUsuariosParaDatosExistentes() {
  console.log('=== Generando usuarios para datos existentes ===\n');

  await fuenteDatos.initialize();
  console.log('✓ Conexión a BD establecida');

  const ejecutorConsultas = fuenteDatos.createQueryRunner();
  await ejecutorConsultas.startTransaction();

  try {
    const anioActual = new Date().getFullYear().toString();

    const mapaCargoRol: Record<string, string> = {
      docente: 'docente',
      secretaria: 'secretaria',
      director_academico: 'director_academico',
      rector: 'rector',
      apoyo: 'apoyo',
      bibliotecario: 'apoyo',
    };

    let estudiantesConUsuario = 0;
    let estudiantesConUsuarioCreado = 0;
    let personalConUsuario = 0;
    let personalConUsuarioCreado = 0;

    console.log('\n[1/2] Procesando estudiantes...\n');

    const estudiantes: any[] = await ejecutorConsultas.query(`
      SELECT e.id, e.codigo_inscripcion, e."personaId" AS persona_id, e.estado, p.ci
      FROM estudiantes e
      JOIN personas p ON e."personaId" = p.id
      ORDER BY e.id
    `);

    for (const estudiante of estudiantes) {
      const usuarioExistente: any[] = await ejecutorConsultas.query(
        `SELECT id FROM usuarios WHERE "personaId" = $1`,
        [estudiante.persona_id]
      );

      if (usuarioExistente.length > 0) {
        console.log(`  - Estudiante ${estudiante.codigo_inscripcion}: ya tiene usuario`);
        estudiantesConUsuario++;
      } else {
        const nombreUsuario = `est_${estudiante.codigo_inscripcion.replace(/[^a-zA-Z0-9]/g, '_')}`;
        const contrasena = `${estudiante.ci}-${anioActual}`;
        const hashContrasena = await bcrypt.hash(contrasena, 10);

        await ejecutorConsultas.query(
          `INSERT INTO usuarios ("personaId", nombre_usuario, contrasena_hash, estado)
           VALUES ($1, $2, $3, $4)`,
          [estudiante.persona_id, nombreUsuario, hashContrasena, EstadoUsuario.ACTIVO]
        );

        const usuarioEstudiante: any[] = await ejecutorConsultas.query(
          `SELECT id FROM usuarios WHERE nombre_usuario = $1`,
          [nombreUsuario]
        );

        const rolEstudiante: any[] = await ejecutorConsultas.query(
          `SELECT id FROM roles WHERE codigo = 'estudiante'`
        );

        if (rolEstudiante.length > 0) {
          await ejecutorConsultas.query(
            `INSERT INTO usuario_roles (usuario_id, rol_id) VALUES ($1, $2)`,
            [usuarioEstudiante[0].id, rolEstudiante[0].id]
          );
        }

        console.log(`  ✓ Estudiante ${estudiante.codigo_inscripcion}: ${nombreUsuario} / ${contrasena}`);
        estudiantesConUsuarioCreado++;
      }
    }

    console.log('\n[2/2] Procesando personal...\n');

    const personal: any[] = await ejecutorConsultas.query(`
      SELECT p.id, p.cargo, p."personaId" AS persona_id, p.estado, per.ci
      FROM personal p
      JOIN personas per ON p."personaId" = per.id
      ORDER BY p.id
    `);

    for (const empleado of personal) {
      const usuarioExistente: any[] = await ejecutorConsultas.query(
        `SELECT id FROM usuarios WHERE "personaId" = $1`,
        [empleado.persona_id]
      );

      if (usuarioExistente.length > 0) {
        console.log(`  - Personal ${empleado.id} (${empleado.cargo}): ya tiene usuario`);
        personalConUsuario++;
      } else {
        const nombreUsuario = `doc_${empleado.ci.replace(/[^a-zA-Z0-9]/g, '')}`;
        const contrasena = `${empleado.ci}-${anioActual}`;
        const hashContrasena = await bcrypt.hash(contrasena, 10);

        await ejecutorConsultas.query(
          `INSERT INTO usuarios ("personaId", nombre_usuario, contrasena_hash, estado)
           VALUES ($1, $2, $3, $4)`,
          [empleado.persona_id, nombreUsuario, hashContrasena, EstadoUsuario.ACTIVO]
        );

        const usuarioEmpleado: any[] = await ejecutorConsultas.query(
          `SELECT id FROM usuarios WHERE nombre_usuario = $1`,
          [nombreUsuario]
        );

        const codigoRol = mapaCargoRol[empleado.cargo] || 'apoyo';
        const rol: any[] = await ejecutorConsultas.query(
          `SELECT id FROM roles WHERE codigo = $1`,
          [codigoRol]
        );

        if (rol.length > 0) {
          await ejecutorConsultas.query(
            `INSERT INTO usuario_roles (usuario_id, rol_id) VALUES ($1, $2)`,
            [usuarioEmpleado[0].id, rol[0].id]
          );
        }

        console.log(`  ✓ Personal ${empleado.id} (${empleado.cargo}): ${nombreUsuario} / ${contrasena}`);
        personalConUsuarioCreado++;
      }
    }

    await ejecutorConsultas.commitTransaction();

    console.log('\n=== Resumen ===');
    console.log(`Estudiantes con usuario: ${estudiantesConUsuario}`);
    console.log(`Estudiantes con usuario creado: ${estudiantesConUsuarioCreado}`);
    console.log(`Personal con usuario: ${personalConUsuario}`);
    console.log(`Personal con usuario creado: ${personalConUsuarioCreado}`);
    console.log('\n=== Proceso completado ===');

  } catch (error) {
    await ejecutorConsultas.rollbackTransaction();
    throw error;
  } finally {
    await ejecutorConsultas.release();
    await fuenteDatos.destroy();
  }
}

generarUsuariosParaDatosExistentes().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
