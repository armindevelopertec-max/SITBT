import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

/**
 * Semilla mínima: solo crea el rol "administrador" y el usuario admin/admin123.
 * No crea los demás roles ni la configuración institucional.
 *
 * Uso: npm run semilla:admin
 */
const fuenteDatos = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5434'),
  username: process.env.DB_USERNAME || 'sitbt',
  password: process.env.DB_PASSWORD || 'sitbt_password',
  database: process.env.DB_DATABASE || 'sitbt_db',
  entities: [__dirname + '/entidades/*.entidad.{ts,js}'],
  synchronize: true,
});

async function sembrarAdmin() {
  console.log('=== Semilla mínima: administrador ===');

  await fuenteDatos.initialize();
  console.log('✓ Conexión a BD establecida');

  const ejecutor = fuenteDatos.createQueryRunner();
  await ejecutor.startTransaction();

  try {
    // 1. Rol administrador
    console.log('\n[1/3] Asegurando rol administrador...');
    let resultadoRol: any[] = await ejecutor.query(
      `SELECT id FROM roles WHERE codigo = 'administrador'`
    );

    if (resultadoRol.length === 0) {
      resultadoRol = await ejecutor.query(
        `INSERT INTO roles (codigo, nombre, descripcion, estado)
         VALUES ('administrador', 'Administrador', 'Acceso total al sistema', 'activo')
         RETURNING id`
      );
      console.log('  ✓ Rol creado: Administrador');
    } else {
      console.log('  - Rol ya existe: Administrador');
    }
    const idRolAdministrador = resultadoRol[0].id;

    // 2. Persona y usuario admin
    console.log('\n[2/3] Asegurando usuario admin...');
    let resultadoPersona: any[] = await ejecutor.query(
      `SELECT id FROM personas WHERE ci = '0000001'`
    );

    let idPersona: number;
    if (resultadoPersona.length === 0) {
      const insertada: any[] = await ejecutor.query(
        `INSERT INTO personas (ci, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, genero, "estadoCivil", nacionalidad, correo, estado)
         VALUES ('0000001', 'Administrador', 'Sistema', 'SITBT', '1990-01-01', 'M', 'Soltera(o)', 'Boliviana', 'admin@sitbt.edu.bo', 'activo')
         RETURNING id`
      );
      idPersona = insertada[0].id;
      console.log('  ✓ Persona creada');
    } else {
      idPersona = resultadoPersona[0].id;
      console.log('  - Persona ya existe');
    }

    let resultadoUsuario: any[] = await ejecutor.query(
      `SELECT id FROM usuarios WHERE nombre_usuario = 'admin'`
    );

    let idUsuario: number;
    if (resultadoUsuario.length === 0) {
      const hash = await bcrypt.hash('admin123', 10);
      const insertado: any[] = await ejecutor.query(
        `INSERT INTO usuarios ("personaId", nombre_usuario, contrasena_hash, estado)
         VALUES ($1, 'admin', $2, 'activo')
         RETURNING id`,
        [idPersona, hash]
      );
      idUsuario = insertado[0].id;
      console.log('  ✓ Usuario creado: admin / admin123');
    } else {
      idUsuario = resultadoUsuario[0].id;
      console.log('  - Usuario ya existe: admin');
    }

    // 3. Asignar rol
    console.log('\n[3/3] Asignando rol administrador...');
    const asignado: any[] = await ejecutor.query(
      `SELECT id FROM usuario_roles WHERE usuario_id = $1 AND rol_id = $2`,
      [idUsuario, idRolAdministrador]
    );

    if (asignado.length === 0) {
      await ejecutor.query(
        `INSERT INTO usuario_roles (usuario_id, rol_id) VALUES ($1, $2)`,
        [idUsuario, idRolAdministrador]
      );
      console.log('  ✓ Rol administrador asignado');
    } else {
      console.log('  - Rol ya asignado');
    }

    await ejecutor.commitTransaction();

    console.log('\n=== Listo ===');
    console.log('Usuario:    admin');
    console.log('Contraseña: admin123');
  } catch (error) {
    await ejecutor.rollbackTransaction();
    throw error;
  } finally {
    await ejecutor.release();
    await fuenteDatos.destroy();
  }
}

sembrarAdmin().catch((error) => {
  console.error('Error en semilla mínima:', error);
  process.exit(1);
});
