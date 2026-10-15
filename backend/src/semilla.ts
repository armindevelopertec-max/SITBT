import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Persona } from './entidades/persona.entidad';
import { Usuario } from './entidades/usuario.entidad';
import { Rol } from './entidades/rol.entidad';
import { UsuarioRol } from './entidades/usuario-rol.entidad';
import { ConfiguracionInstitucional } from './entidades/configuracion-institucional.entidad';
import { Estudiante } from './entidades/estudiante.entidad';
import { Carrera } from './entidades/carrera.entidad';
import { PlanEstudio } from './entidades/plan-estudio.entidad';

const fuenteDatos = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5434'),
  username: process.env.DB_USERNAME || 'sitbt',
  password: process.env.DB_PASSWORD || 'sitbt_password',
  database: process.env.DB_DATABASE || 'sitbt_db',
  entities: [Persona, Usuario, Rol, UsuarioRol, ConfiguracionInstitucional, Estudiante, Carrera, PlanEstudio],
  synchronize: true,
});

async function sembrar() {
  console.log('=== Semilla: Creando usuario administrador ===');

  await fuenteDatos.initialize();
  console.log('✓ Conexión a BD establecida');
  console.log('✓ Tablas sincronizadas');

  const ejecutorConsultas = fuenteDatos.createQueryRunner();
  await ejecutorConsultas.startTransaction();

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
    for (const rol of roles) {
      const resultado: any[] = await ejecutorConsultas.query(
        `SELECT id FROM roles WHERE codigo = $1`,
        [rol.codigo]
      );
      if (resultado.length === 0) {
        await ejecutorConsultas.query(
          `INSERT INTO roles (codigo, nombre, descripcion, estado) VALUES ($1, $2, $3, 'activo')`,
          [rol.codigo, rol.nombre, rol.descripcion]
        );
        console.log(`  ✓ Rol creado: ${rol.nombre}`);
      } else {
        console.log(`  - Rol ya existe: ${rol.nombre}`);
      }
    }

    console.log('\n[2/4] Creando persona administradora...');
    const resultadoPersona: any[] = await ejecutorConsultas.query(
      `SELECT id FROM personas WHERE ci = $1`,
      ['0000001']
    );

    let idPersona: number;
    if (resultadoPersona.length === 0) {
      const resultadoInsercion: any[] = await ejecutorConsultas.query(
        `INSERT INTO personas (ci, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, genero, estado_civil, nacionalidad, correo, estado)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'activo')
         RETURNING id`,
        ['0000001', 'Administrador', 'Sistema', 'SITBT', '1990-01-01', 'M', 'Soltera(o)', 'Boliviana', 'admin@sitbt.edu.bo']
      );
      idPersona = resultadoInsercion[0].id;
      console.log('  ✓ Persona creada');
    } else {
      idPersona = resultadoPersona[0].id;
      console.log('  - Persona ya existe');
    }

    console.log('\n[3/4] Creando usuario admin...');
    const resultadoUsuario: any[] = await ejecutorConsultas.query(
      `SELECT id FROM usuarios WHERE nombre_usuario = $1`,
      ['admin']
    );

    let idUsuario: number;
    if (resultadoUsuario.length === 0) {
      const hashContrasena = await bcrypt.hash('admin123', 10);
      const resultadoInsercion: any[] = await ejecutorConsultas.query(
        `INSERT INTO usuarios (persona_id, nombre_usuario, contrasena_hash, estado)
         VALUES ($1, $2, $3, 'activo')
         RETURNING id`,
        [idPersona, 'admin', hashContrasena]
      );
      idUsuario = resultadoInsercion[0].id;
      console.log('  ✓ Usuario creado: admin / admin123');
    } else {
      idUsuario = resultadoUsuario[0].id;
      console.log('  - Usuario ya existe: admin');
    }

    console.log('\n[4/4] Asignando rol administrador...');
    const rolAdministrador: any[] = await ejecutorConsultas.query(
      `SELECT id FROM roles WHERE codigo = 'administrador'`
    );

    const resultadoUsuarioRol: any[] = await ejecutorConsultas.query(
      `SELECT id FROM usuario_roles WHERE usuario_id = $1 AND rol_id = $2`,
      [idUsuario, rolAdministrador[0].id]
    );

    if (resultadoUsuarioRol.length === 0) {
      await ejecutorConsultas.query(
        `INSERT INTO usuario_roles (usuario_id, rol_id) VALUES ($1, $2)`,
        [idUsuario, rolAdministrador[0].id]
      );
      console.log('  ✓ Rol administrador asignado');
    } else {
      console.log('  - Rol ya asignado');
    }

    console.log('\n[5/5] Creando configuración institucional...');
    const resultadoConfiguracion: any[] = await ejecutorConsultas.query(
      `SELECT id FROM configuracion_institucional LIMIT 1`
    );

    if (resultadoConfiguracion.length === 0) {
      await ejecutorConsultas.query(
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

    await ejecutorConsultas.commitTransaction();

    console.log('\n=== Semilla completada ===');
    console.log('Usuario: admin');
    console.log('Contraseña: admin123');

  } catch (error) {
    await ejecutorConsultas.rollbackTransaction();
    throw error;
  } finally {
    await ejecutorConsultas.release();
    await fuenteDatos.destroy();
  }
}

sembrar().catch((error) => {
  console.error('Error en semilla:', error);
  process.exit(1);
});
