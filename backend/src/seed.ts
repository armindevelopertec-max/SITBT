import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Persona } from './entities/persona.entity';
import { Usuario } from './entities/usuario.entity';
import { Rol } from './entities/rol.entity';
import { UsuarioRol } from './entities/usuario-rol.entity';
import { InstitutionSettings } from './entities/institution-settings.entity';
import { Estudiante } from './entities/estudiante.entity';
import { Carrera } from './entities/carrera.entity';
import { PlanEstudio } from './entities/plan-estudio.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5434'),
  username: process.env.DB_USERNAME || 'sitbt',
  password: process.env.DB_PASSWORD || 'sitbt_password',
  database: process.env.DB_DATABASE || 'sitbt_db',
  entities: [Persona, Usuario, Rol, UsuarioRol, InstitutionSettings, Estudiante, Carrera, PlanEstudio],
  synchronize: true,
});

async function seed() {
  console.log('=== Seed: Creando usuario administrador ===');

  await AppDataSource.initialize();
  console.log('✓ Conexión a BD establecida');
  console.log('✓ Tablas sincronizadas');

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.startTransaction();

  try {
    const roles = [
      { code: 'administrador', name: 'Administrador', description: 'Acceso total al sistema' },
      { code: 'secretaria', name: 'Secretaría', description: 'Gestión de personas y estudiantes' },
      { code: 'director_academico', name: 'Director Académico', description: 'Gestión académica' },
      { code: 'rector', name: 'Rector', description: 'Reportes globales' },
      { code: 'docente', name: 'Docente', description: 'Calificaciones' },
      { code: 'estudiante', name: 'Estudiante', description: 'Acceso a notas y kardex' },
      { code: 'apoyo', name: 'Apoyo', description: 'Acceso limitado' },
    ];

    console.log('\n[1/4] Creando roles...');
    for (const role of roles) {
      const result: any[] = await queryRunner.query(
        `SELECT id FROM roles WHERE code = $1`,
        [role.code]
      );
      if (result.length === 0) {
        await queryRunner.query(
          `INSERT INTO roles (code, name, description, status) VALUES ($1, $2, $3, 'activo')`,
          [role.code, role.name, role.description]
        );
        console.log(`  ✓ Rol creado: ${role.name}`);
      } else {
        console.log(`  - Rol ya existe: ${role.name}`);
      }
    }

    console.log('\n[2/4] Creando persona administrador...');
    const personResult: any[] = await queryRunner.query(
      `SELECT id FROM persons WHERE ci = $1`,
      ['0000001']
    );

    let personId: number;
    if (personResult.length === 0) {
      const insertResult: any[] = await queryRunner.query(
        `INSERT INTO persons (ci, names, lastname_paternal, lastname_maternal, birthdate, gender, marital_status, nationality, email, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'activo')
         RETURNING id`,
        ['0000001', 'Administrador', 'Sistema', 'SITBT', '1990-01-01', 'M', 'Soltera(o)', 'Boliviana', 'admin@sitbt.edu.bo']
      );
      personId = insertResult[0].id;
      console.log('  ✓ Persona creada');
    } else {
      personId = personResult[0].id;
      console.log('  - Persona ya existe');
    }

    console.log('\n[3/4] Creando usuario admin...');
    const userResult: any[] = await queryRunner.query(
      `SELECT id FROM users WHERE username = $1`,
      ['admin']
    );

    let userId: number;
    if (userResult.length === 0) {
      const passwordHash = await bcrypt.hash('admin123', 10);
      const insertResult: any[] = await queryRunner.query(
        `INSERT INTO users (person_id, username, password_hash, status)
         VALUES ($1, $2, $3, 'activo')
         RETURNING id`,
        [personId, 'admin', passwordHash]
      );
      userId = insertResult[0].id;
      console.log('  ✓ Usuario creado: admin / admin123');
    } else {
      userId = userResult[0].id;
      console.log('  - Usuario ya existe: admin');
    }

    console.log('\n[4/4] Asignando rol administrador...');
    const adminRole: any[] = await queryRunner.query(
      `SELECT id FROM roles WHERE code = 'administrador'`
    );

    const userRoleResult: any[] = await queryRunner.query(
      `SELECT id FROM user_roles WHERE user_id = $1 AND role_id = $2`,
      [userId, adminRole[0].id]
    );

    if (userRoleResult.length === 0) {
      await queryRunner.query(
        `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)`,
        [userId, adminRole[0].id]
      );
      console.log('  ✓ Rol administrador asignado');
    } else {
      console.log('  - Rol ya asignado');
    }

    console.log('\n[5/5] Creando configuración institucional...');
    const settingsResult: any[] = await queryRunner.query(
      `SELECT id FROM institution_settings LIMIT 1`
    );

    if (settingsResult.length === 0) {
      await queryRunner.query(
        `INSERT INTO institution_settings (nombre, nombre_corto, lema, direccion, telefono, departamento, email, ciudad, pais, descripcion)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          'Instituto Tecnológico Boliviana de Tecnología',
          'SITBT',
          'Formando profesionales técnicos de excelencia',
          'Av. Bolivia No. 1234, Zona Central',
          '+591 2 1234567',
          'La Paz',
          'contacto@sitbt.edu.bo',
          'La Paz',
          'Bolivia',
          'Institución educativa técnica comprometida con la formación integral y la excelencia académica.'
        ]
      );
      console.log('  ✓ Configuración institucional creada');
    } else {
      console.log('  - Configuración institucional ya existe');
    }

    await queryRunner.commitTransaction();

    console.log('\n=== Seed completado ===');
    console.log('Usuario: admin');
    console.log('Contraseña: admin123');

  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
    await AppDataSource.destroy();
  }
}

seed().catch((error) => {
  console.error('Error en seed:', error);
  process.exit(1);
});
