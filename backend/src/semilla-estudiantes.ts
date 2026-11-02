import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

const fuenteDatos = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5434'),
  username: process.env.DB_USERNAME || 'sitbt',
  password: process.env.DB_PASSWORD || 'sitbt_password',
  database: process.env.DB_DATABASE || 'sitbt_db',
  synchronize: false,
});

/**
 * Seed: puebla estudiantes a partir de estudiantes_2026.json.
 *
 * NO modifica el modulo de estudiantes: inserta personas, estudiantes y usuarios
 * siguiendo el mismo patron que ServicioEstudiantes.crear().
 *
 * Por defecto inserta una cantidad pequeña y ALEATORIA de estudiantes (5) para
 * poder probar el sistema sin llenar la base. Se puede cambiar con la variable
 * de entorno CANTIDAD_ESTUDIANTES:
 *
 *   npm run semilla:estudiantes                       -> 5 aleatorios
 *   CANTIDAD_ESTUDIANTES=20 npm run semilla:estudiantes -> 20 aleatorios
 *   CANTIDAD_ESTUDIANTES=0 npm run semilla:estudiantes  -> todos (188)
 *
 * Requiere las carreras y planes de estudio vigentes:
 *   npm run semilla:carreras
 *
 * El JSON de origen no trae genero ni fecha de nacimiento; se resuelven asi:
 *  - genero: lista explicita de CI femeninas (el resto se asume M).
 *  - fecha_nacimiento: valor provisional (la columna no admite nulos).
 */
const RUTA_JSON =
  process.env.ESTUDIANTES_JSON ||
  path.resolve(__dirname, '..', '..', 'estudiantes_2026.json');

const GESTION = process.env.GESTION_SEMILLA || '2026';
const FECHA_ADMISION = `${GESTION}-02-02`;
const FECHA_NACIMIENTO_PROVISIONAL = '2005-01-01';

/**
 * Cantidad de estudiantes a insertar.
 * 0 significa "todos los del archivo".
 */
const CANTIDAD_ESTUDIANTES = parseInt(
  process.env.CANTIDAD_ESTUDIANTES ?? '5',
  10,
);

// Estudiantes con nombre femenino (segun revisión del padrón).
const CIS_FEMENINAS = new Set<string>([
  '11074474', // QUISPE MATTA ABIGAIL
  '6140391',  // QUISPE RODRIGUEZ GLADIS MIRIAM
  '6942808',  // QUISPE RODRIGUEZ JUDITH MADELY
  '9257213',  // QUISPE TICONA CARLA ANDREA
  '13741813', // SUMI LLUSCO YANINA
  '9994875',  // TORREZ LAURA LARRY TATIANA
  '9941588',  // TURPO CANAVIRI LUZ BELEN
  '6068460',  // VICENTE ESPINO FRANCISCA
  '7022739',  // CADENA MAMANI YHANET
  '6887079',  // YUJRA QUISPE ESTER JHANET
]);

const SEMESTRES: Record<string, number> = {
  PRIMERO: 1, SEGUNDO: 2, TERCERO: 3, CUARTO: 4, QUINTO: 5,
  SEXTO: 6, SEPTIMO: 7, OCTAVO: 8, NOVENO: 9, DECIMO: 10,
};

interface EstudianteJson {
  n: number;
  apellidos_y_nombres: string;
  ci: number | string;
  carrera: string;
  nivel_formacion: string;
  regimen_estudio: string;
  paralelo: string;
  turno: string;
  semestre: string;
}

function normalizar(texto: string): string {
  return (texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();
}

/** Separa "APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES" respetando apellidos compuestos. */
function partirNombre(completo: string) {
  const t = (completo || '').trim().split(/\s+/);
  if (t.length <= 2) {
    return { apellidoPaterno: t[0] || '', apellidoMaterno: '', nombres: t[1] || '' };
  }
  // Apellido materno compuesto: "... DE LA CRUZ ..." / "... DE LOS ..." etc.
  if (/^(DE|DEL|LA|LAS|LOS|DA|VAN|VON|SAN|SANTA)$/i.test(t[1]) && t.length >= 5) {
    return {
      apellidoPaterno: t[0],
      apellidoMaterno: t.slice(1, 4).join(' '),
      nombres: t.slice(4).join(' '),
    };
  }
  return { apellidoPaterno: t[0], apellidoMaterno: t[1], nombres: t.slice(2).join(' ') };
}

function iniciales(apellidoPaterno: string, apellidoMaterno: string, nombres: string): string {
  const letra = (s: string) => (s || '').replace(/[^A-Za-z]/g, '').charAt(0).toUpperCase();
  return `${letra(apellidoPaterno)}${letra(apellidoMaterno)}${letra(nombres)}` || 'EST';
}

async function sembrarEstudiantes() {
  console.log('=== Semilla: Estudiantes ===');

  if (!fs.existsSync(RUTA_JSON)) {
    throw new Error(`No se encontró el archivo JSON: ${RUTA_JSON}`);
  }
  const contenido = JSON.parse(fs.readFileSync(RUTA_JSON, 'utf-8'));
  const estudiantesJson: EstudianteJson[] = contenido.estudiantes || [];
  console.log(`✓ Archivo leído: ${RUTA_JSON} (${estudiantesJson.length} registros)`);

  await fuenteDatos.initialize();
  console.log('✓ Conexión a BD establecida');

  const ejecutor = fuenteDatos.createQueryRunner();
  await ejecutor.startTransaction();

  let personasCreadas = 0;
  let estudiantesCreados = 0;
  let usuariosCreados = 0;
  let omitidos = 0;
  let ya_existentes = 0;
  const advertencias: string[] = [];

  try {
    // Catalogos
    const carreras: any[] = await ejecutor.query(`SELECT id, nombre FROM carreras`);
    const carreraPorNombre = new Map<string, any>();
    carreras.forEach((c) => carreraPorNombre.set(normalizar(c.nombre), c));

    const planes: any[] = await ejecutor.query(
      `SELECT id, carrera_id, estado FROM planes_estudio ORDER BY id`
    );
    const planPorCarrera = new Map<number, number>();
    planes.forEach((p) => {
      if (p.estado === 'vigente' || !planPorCarrera.has(p.carrera_id)) {
        planPorCarrera.set(p.carrera_id, p.id);
      }
    });

    // El rol NO se crea aquí: el administrador lo crea desde /roles.
    // Si ya existe y está activo, se asigna a los estudiantes.
    const rolEstudiante: any[] = await ejecutor.query(
      `SELECT id FROM roles WHERE codigo = 'estudiante' AND estado = 'activo'`
    );
    const idRolEstudiante: number | null =
      rolEstudiante.length > 0 ? rolEstudiante[0].id : null;
    if (idRolEstudiante === null) {
      console.warn(
        "  ! No existe el rol activo 'estudiante': los estudiantes se crearán SIN rol."
      );
      console.warn('    Créalo desde /roles y asígnalo desde /usuarios.');
    }

    const codigosUsados = new Set<string>(
      (await ejecutor.query(`SELECT codigo_inscripcion FROM estudiantes`)).map(
        (r: any) => r.codigo_inscripcion
      )
    );

    // Selección aleatoria: se mezcla el archivo para no insertar siempre los
    // primeros.
    const candidatos = [...estudiantesJson];
    for (let i = candidatos.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidatos[i], candidatos[j]] = [candidatos[j], candidatos[i]];
    }

    // CANTIDAD_ESTUDIANTES es el TOTAL objetivo, no la cantidad a insertar en
    // esta ejecución: si ya hay estudiantes del archivo, solo se crean los
    // que falten. Así el seed se puede reejecutar sin duplicar ni crecer.
    const objetivo =
      CANTIDAD_ESTUDIANTES > 0
        ? Math.min(CANTIDAD_ESTUDIANTES, candidatos.length)
        : candidatos.length;

    const existentes: any[] = await ejecutor.query(
      `SELECT DISTINCT pe.ci FROM estudiantes e JOIN personas pe ON pe.id = e."personaId"`
    );
    const ciExistentes = new Set<string>(
      existentes.map((fila: any) => String(fila.ci).trim())
    );

    const yaEnBase = candidatos.filter((item) =>
      ciExistentes.has(String(item.ci).trim()),
    ).length;

    const faltantes = Math.max(0, objetivo - yaEnBase);

    console.log(
      `→ Objetivo: ${objetivo} estudiante(s). Ya en la base: ${yaEnBase}. ` +
        `Se crearán ${faltantes} (selección aleatoria de ${candidatos.length} disponibles)`
    );

    for (const item of candidatos) {
      // Ya se alcanzó la cantidad pedida: se corta el recorrido.
      if (estudiantesCreados >= faltantes) {
        break;
      }

      const ci = String(item.ci).trim();
      const carrera = carreraPorNombre.get(normalizar(item.carrera));
      if (!carrera) {
        advertencias.push(`n=${item.n} CI ${ci}: carrera desconocida "${item.carrera}" — omitido`);
        omitidos++;
        continue;
      }
      const planEstudioId = planPorCarrera.get(carrera.id);
      if (!planEstudioId) {
        advertencias.push(`n=${item.n} CI ${ci}: sin plan de estudio vigente para "${carrera.nombre}" — omitido`);
        omitidos++;
        continue;
      }

      const { apellidoPaterno, apellidoMaterno, nombres } = partirNombre(item.apellidos_y_nombres);
      const genero = CIS_FEMENINAS.has(ci) ? 'F' : 'M';

      // 1) Persona (reutiliza por CI)
      let idPersona: number;
      const personaExistente: any[] = await ejecutor.query(
        `SELECT id FROM personas WHERE ci = $1`,
        [ci]
      );
      if (personaExistente.length > 0) {
        idPersona = personaExistente[0].id;
      } else {
        const nueva: any[] = await ejecutor.query(
          `INSERT INTO personas (ci, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, genero, nacionalidad, estado)
           VALUES ($1, $2, $3, $4, $5, $6, 'Boliviana', 'activo')
           RETURNING id`,
          [ci, nombres, apellidoPaterno, apellidoMaterno, FECHA_NACIMIENTO_PROVISIONAL, genero]
        );
        idPersona = nueva[0].id;
        personasCreadas++;
      }

      // 2) Estudiante (idempotente por persona + carrera + plan)
      const existeEstudiante: any[] = await ejecutor.query(
        `SELECT id FROM estudiantes WHERE "personaId" = $1 AND carrera_id = $2 AND plan_estudio_id = $3`,
        [idPersona, carrera.id, planEstudioId]
      );
      if (existeEstudiante.length > 0) {
        // Ya estaba en la base: no cuenta para el límite pedido.
        ya_existentes++;
      } else {
        // Codigo de inscripcion: INICIALES-CARRERAaa-XX (desambigua con -n)
        const codigoCarrera = normalizar(carrera.nombre).substring(0, 2);
        const sufijoAnio = GESTION.slice(-2);
        const ciUltimos2 = ci.slice(-2).padStart(2, '0');
        let codigo = `${iniciales(apellidoPaterno, apellidoMaterno, nombres)}-${codigoCarrera}${sufijoAnio}${ciUltimos2}`;
        let contador = 1;
        while (codigosUsados.has(codigo)) {
          codigo = `${iniciales(apellidoPaterno, apellidoMaterno, nombres)}-${codigoCarrera}${sufijoAnio}${ciUltimos2}-${contador}`;
          contador++;
        }
        codigosUsados.add(codigo);

        await ejecutor.query(
          `INSERT INTO estudiantes (\"personaId\", gestion_admision, codigo_inscripcion, carrera_id, plan_estudio_id, fecha_admision, estado, "estadoMatricula", origen)
           VALUES ($1, $2, $3, $4, $5, $6, 'activo', 'matriculado', 'secretaria')`,
          [idPersona, GESTION, codigo, carrera.id, planEstudioId, FECHA_ADMISION]
        );
        estudiantesCreados++;
      }

      // 3) Usuario + rol estudiante (uno por persona)
      const usuarioExistente: any[] = await ejecutor.query(
        `SELECT id FROM usuarios WHERE "personaId" = $1`,
        [idPersona]
      );
      let idUsuario: number;
      if (usuarioExistente.length > 0) {
        idUsuario = usuarioExistente[0].id;
      } else {
        const codigoEstudiante: any[] = await ejecutor.query(
          `SELECT codigo_inscripcion FROM estudiantes WHERE "personaId" = $1 ORDER BY id LIMIT 1`,
          [idPersona]
        );
        const nombreUsuario = `est_${String(codigoEstudiante[0].codigo_inscripcion).replace(/[^a-zA-Z0-9]/g, '_')}`;
        const contrasena = `${ci}-${GESTION}`;
        const hash = await bcrypt.hash(contrasena, 10);
        const insertado: any[] = await ejecutor.query(
          `INSERT INTO usuarios ("personaId", nombre_usuario, contrasena_hash, estado)
           VALUES ($1, $2, $3, 'activo') RETURNING id`,
          [idPersona, nombreUsuario, hash]
        );
        idUsuario = insertado[0].id;
        usuariosCreados++;
      }

      if (idRolEstudiante !== null) {
        const rolAsignado: any[] = await ejecutor.query(
          `SELECT id FROM usuario_roles WHERE usuario_id = $1 AND rol_id = $2`,
          [idUsuario, idRolEstudiante]
        );
        if (rolAsignado.length === 0) {
          await ejecutor.query(
            `INSERT INTO usuario_roles (usuario_id, rol_id) VALUES ($1, $2)`,
            [idUsuario, idRolEstudiante]
          );
          console.log(`      ↳ Rol asignado: estudiante`);
        }
      }
    }

    await ejecutor.commitTransaction();

    console.log('\n=== Resumen ===');
    console.log(`Objetivo de estudiantes: ${objetivo}`);
    console.log(`Personas creadas:    ${personasCreadas}`);
    console.log(`Estudiantes creados: ${estudiantesCreados}`);
    console.log(`Usuarios creados:    ${usuariosCreados}`);
    console.log(`Omitidos (sin carrera o plan): ${omitidos}`);
    console.log(`Ya existentes (no contados): ${ya_existentes}`);
    console.log(`Acceso estudiantes: usuario est_<codigo> / contraseña <CI>-${GESTION}`);
    if (idRolEstudiante === null) {
      console.log("Roles asignados: ninguno (falta crear el rol 'estudiante' desde /roles)");
    } else {
      console.log('Roles asignados: estudiante');
    }
    if (advertencias.length > 0) {
      console.log(`\nAdvertencias (${advertencias.length}):`);
      advertencias.forEach((a) => console.log('  - ' + a));
    }
    console.log('\n=== Semilla de estudiantes completada ===');
  } catch (error) {
    await ejecutor.rollbackTransaction();
    throw error;
  } finally {
    await ejecutor.release();
    await fuenteDatos.destroy();
  }
}

sembrarEstudiantes().catch((error) => {
  console.error('Error en semilla de estudiantes:', error);
  process.exit(1);
});
