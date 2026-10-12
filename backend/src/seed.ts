import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Persona } from './entities/persona.entity';
import { Usuario } from './entities/usuario.entity';
import { Rol } from './entities/rol.entity';
import { UsuarioRol } from './entities/usuario-rol.entity';
import { ConfiguracionInstitucional } from './entities/configuracion-institucional.entity';
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
  entities: [Persona, Usuario, Rol, UsuarioRol, ConfiguracionInstitucional, Estudiante, Carrera, PlanEstudio],
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
      { codigo: 'administrador', nombre: 'Administrador', descripcion: 'Acceso total al sistema' },
      { codigo: 'secretaria', nombre: 'Secretaría', descripcion: 'Gestión de personas y estudiantes' },
      { codigo: 'director_academico', nombre: 'Director Académico', descripcion: 'Gestión académica' },
      { codigo: 'rector', nombre: 'Rector', descripcion: 'Reportes globales' },
      { codigo: 'docente', nombre: 'Docente', descripcion: 'Calificaciones' },
      { codigo: 'estudiante', nombre: 'Estudiante', descripcion: 'Acceso a notas y kardex' },
      { codigo: 'apoyo', nombre: 'Apoyo', descripcion: 'Acceso limitado' },
    ];

    console.log('\n[1/4] Creando roles...');
    for (const role of roles) {
      const result: any[] = await queryRunner.query(
        `SELECT id FROM roles WHERE codigo = $1`,
        [role.codigo]
      );
      if (result.length === 0) {
        await queryRunner.query(
          `INSERT INTO roles (codigo, nombre, descripcion, estado) VALUES ($1, $2, $3, 'activo')`,
          [role.codigo, role.nombre, role.descripcion]
        );
        console.log(`  ✓ Rol creado: ${role.nombre}`);
      } else {
        console.log(`  - Rol ya existe: ${role.nombre}`);
      }
    }

    console.log('\n[2/4] Creando persona administradora...');
    const personResult: any[] = await queryRunner.query(
      `SELECT id FROM personas WHERE ci = $1`,
      ['0000001']
    );

    let personId: number;
    if (personResult.length === 0) {
      const insertResult: any[] = await queryRunner.query(
        `INSERT INTO personas (ci, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, genero, estado_civil, nacionalidad, correo, estado)
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
      `SELECT id FROM usuarios WHERE nombre_usuario = $1`,
      ['admin']
    );

    let userId: number;
    if (userResult.length === 0) {
      const passwordHash = await bcrypt.hash('admin123', 10);
      const insertResult: any[] = await queryRunner.query(
        `INSERT INTO usuarios (persona_id, nombre_usuario, contrasena_hash, estado)
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
      `SELECT id FROM roles WHERE codigo = 'administrador'`
    );

    const userRoleResult: any[] = await queryRunner.query(
      `SELECT id FROM usuario_roles WHERE usuario_id = $1 AND rol_id = $2`,
      [userId, adminRole[0].id]
    );

    if (userRoleResult.length === 0) {
      await queryRunner.query(
        `INSERT INTO usuario_roles (usuario_id, rol_id) VALUES ($1, $2)`,
        [userId, adminRole[0].id]
      );
      console.log('  ✓ Rol administrador asignado');
    } else {
      console.log('  - Rol ya asignado');
    }

    console.log('\n[5/5] Creando configuración institucional...');
    const settingsResult: any[] = await queryRunner.query(
      `SELECT id FROM configuracion_institucional LIMIT 1`
    );

    if (settingsResult.length === 0) {
      await queryRunner.query(
        `INSERT INTO configuracion_institucional (nombre, nombre_corto, lema, direccion, telefono, departamento, correo, ciudad, pais, descripcion)
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
