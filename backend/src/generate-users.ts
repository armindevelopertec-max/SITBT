import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

const AppDataSource = new DataSource({
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

async function generateUsersForExistingData() {
  console.log('=== Generando usuarios para datos existentes ===\n');

  await AppDataSource.initialize();
  console.log('✓ Conexión a BD establecida');

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.startTransaction();

  try {
    const currentYear = new Date().getFullYear().toString();

    const positionRoleMap: Record<string, string> = {
      'docente': 'docente',
      'secretaria': 'secretaria',
      'director_academico': 'director_academico',
      'rector': 'rector',
      'apoyo': 'apoyo',
      'bibliotecario': 'apoyo',
    };

    let estudiantesConUsuario = 0;
    let estudiantesSinUsuario = 0;
    let personalConUsuario = 0;
    let personalSinUsuario = 0;

    console.log('\n[1/2] Procesando estudiantes...\n');

    const estudiantes: any[] = await queryRunner.query(`
      SELECT e.id, e.inscription_code, e.person_id, e.status, p.ci
      FROM students e
      JOIN persons p ON e.person_id = p.id
      ORDER BY e.id
    `);

    for (const estudiante of estudiantes) {
      const existingUser: any[] = await queryRunner.query(
        `SELECT id FROM users WHERE person_id = $1`,
        [estudiante.person_id]
      );

      if (existingUser.length > 0) {
        console.log(`  - Estudiante ${estudiante.inscription_code}: ya tiene usuario`);
        estudiantesConUsuario++;
      } else {
        const username = `est_${estudiante.inscription_code.replace(/[^a-zA-Z0-9]/g, '_')}`;
        const password = `${estudiante.ci}-${currentYear}`;
        const passwordHash = await bcrypt.hash(password, 10);

        await queryRunner.query(
          `INSERT INTO users (person_id, username, password_hash, status)
           VALUES ($1, $2, $3, $4)`,
          [estudiante.person_id, username, passwordHash, EstadoUsuario.ACTIVO]
        );

        const estudianteUser: any[] = await queryRunner.query(
          `SELECT id FROM users WHERE username = $1`,
          [username]
        );

        const rolEstudiante: any[] = await queryRunner.query(
          `SELECT id FROM roles WHERE code = 'estudiante'`
        );

        if (rolEstudiante.length > 0) {
          await queryRunner.query(
            `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)`,
            [estudianteUser[0].id, rolEstudiante[0].id]
          );
        }

        console.log(`  ✓ Estudiante ${estudiante.inscription_code}: ${username} / ${password}`);
        estudiantesSinUsuario++;
      }
    }

    console.log('\n[2/2] Procesando personal...\n');

    const personal: any[] = await queryRunner.query(`
      SELECT p.id, p.cargo, p.person_id, p.estado, per.ci
      FROM staff p
      JOIN persons per ON p.person_id = per.id
      ORDER BY p.id
    `);

    for (const staff of personal) {
      const existingUser: any[] = await queryRunner.query(
        `SELECT id FROM users WHERE person_id = $1`,
        [staff.person_id]
      );

      if (existingUser.length > 0) {
        console.log(`  - Personal ${staff.id} (${staff.cargo}): ya tiene usuario`);
        personalConUsuario++;
      } else {
        const username = `doc_${staff.ci.replace(/[^a-zA-Z0-9]/g, '')}`;
        const password = `${staff.ci}-${currentYear}`;
        const passwordHash = await bcrypt.hash(password, 10);

        await queryRunner.query(
          `INSERT INTO users (person_id, username, password_hash, status)
           VALUES ($1, $2, $3, $4)`,
          [staff.person_id, username, passwordHash, EstadoUsuario.ACTIVO]
        );

        const staffUser: any[] = await queryRunner.query(
          `SELECT id FROM users WHERE username = $1`,
          [username]
        );

        const roleCode = positionRoleMap[staff.cargo] || 'apoyo';
        const rol: any[] = await queryRunner.query(
          `SELECT id FROM roles WHERE code = $1`,
          [roleCode]
        );

        if (rol.length > 0) {
          await queryRunner.query(
            `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)`,
            [staffUser[0].id, rol[0].id]
          );
        }

        console.log(`  ✓ Personal ${staff.id} (${staff.cargo}): ${username} / ${password}`);
        personalSinUsuario++;
      }
    }

    await queryRunner.commitTransaction();

    console.log('\n=== Resumen ===');
    console.log(`Estudiantes con usuario: ${estudiantesConUsuario}`);
    console.log(`Estudiantes con usuario creado: ${estudiantesSinUsuario}`);
    console.log(`Personal con usuario: ${personalConUsuario}`);
    console.log(`Personal con usuario creado: ${personalSinUsuario}`);
    console.log('\n=== Proceso completado ===');

  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
    await AppDataSource.destroy();
  }
}

generateUsersForExistingData().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
