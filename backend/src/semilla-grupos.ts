import 'reflect-metadata';
import { DataSource } from 'typeorm';
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

interface FilaEstudiante {
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

const GESTION = '2026';
const PERIODO = 'I';
const CAPACIDAD = 30;

const MAPA_SEMESTRES: Record<string, number> = {
  PRIMERO: 1,
  SEGUNDO: 2,
  TERCERO: 3,
  CUARTO: 4,
  QUINTO: 5,
  SEXTO: 6,
  SEPTIMO: 7,
  OCTAVO: 8,
  NOVENO: 9,
  DECIMO: 10,
};

/** Quita acentos, espacios sobrantes y pasa a mayúsculas. */
function normalizar(valor: string): string {
  return (valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();
}

function cargarEstudiantes(): FilaEstudiante[] {
  const ruta =
    process.env.ESTUDIANTES_JSON ||
    path.resolve(__dirname, '..', '..', 'estudiantes_2026.json');
  const contenido = fs.readFileSync(ruta, 'utf-8');
  const datos = JSON.parse(contenido);
  return datos.estudiantes as FilaEstudiante[];
}

async function sembrarGrupos() {
  console.log('=== Semilla: Grupos ===');

  await fuenteDatos.initialize();
  console.log('✓ Conexión a BD establecida');

  const estudiantes = cargarEstudiantes();
  console.log(`✓ Estudiantes leídos del JSON: ${estudiantes.length}`);

  const ejecutor = fuenteDatos.createQueryRunner();
  await ejecutor.startTransaction();

  let gruposCreados = 0;
  let gruposActualizados = 0;
  let asignacionesCreadas = 0;
  let asignacionesExistentes = 0;

  try {
    // 1. Turnos: asegurar MAÑANA / TARDE / NOCHE
    const turnosExistentes: any[] = await ejecutor.query(`SELECT id, codigo FROM turnos`);
    const mapaTurnos = new Map<string, number>();
    for (const turno of turnosExistentes) {
      mapaTurnos.set(normalizar(turno.codigo), turno.id);
    }

    const turnosRequeridos = [
      { codigo: 'MAÑANA', nombre: 'Turno Mañana', inicio: '07:00', fin: '12:00' },
      { codigo: 'TARDE', nombre: 'Turno Tarde', inicio: '14:00', fin: '18:00' },
      { codigo: 'NOCHE', nombre: 'Turno Noche', inicio: '19:00', fin: '22:00' },
    ];
    for (const turno of turnosRequeridos) {
      if (!mapaTurnos.has(normalizar(turno.codigo))) {
        const insertado: any[] = await ejecutor.query(
          `INSERT INTO turnos (codigo, nombre, hora_inicio, hora_fin)
           VALUES ($1, $2, $3, $4) RETURNING id`,
          [turno.codigo, turno.nombre, turno.inicio, turno.fin],
        );
        mapaTurnos.set(normalizar(turno.codigo), insertado[0].id);
        console.log(`  ✓ Turno creado: ${turno.codigo}`);
      }
    }

    // 2. Carreras: mapa nombre normalizado -> { id, codigo }
    const carreras: any[] = await ejecutor.query(`SELECT id, codigo, nombre FROM carreras`);
    const mapaCarreras = new Map<string, { id: number; codigo: string }>();
    for (const carrera of carreras) {
      mapaCarreras.set(normalizar(carrera.nombre), { id: carrera.id, codigo: carrera.codigo });
    }

    // 3. Plan vigente por carrera
    const mapaPlanes = new Map<number, number>();
    for (const carrera of carreras) {
      const plan: any[] = await ejecutor.query(
        `SELECT id FROM planes_estudio
         WHERE carrera_id = $1
         ORDER BY (estado = 'vigente') DESC, id ASC
         LIMIT 1`,
        [carrera.id],
      );
      if (plan.length > 0) {
        mapaPlanes.set(carrera.id, plan[0].id);
      }
    }

    // 3b. Periodo (gestión 2026 · periodo I) para vincular periodo_id
    const periodoFila: any[] = await ejecutor.query(
      `SELECT p.id
       FROM periodos p
       JOIN gestiones ge ON ge.id = p."gestionId"
       WHERE ge.anio = $1 AND p.numero = $2
       LIMIT 1`,
      [GESTION, PERIODO],
    );
    if (periodoFila.length === 0) {
      throw new Error(`No existe el periodo ${PERIODO} de la gestión ${GESTION}`);
    }
    const periodoId = periodoFila[0].id;

    // 4. Combinaciones únicas (gestión, carrera, semestre, turno, paralelo)
    interface Combinacion {
      carreraId: number;
      codigoCarrera: string;
      semestre: number;
      turnoId: number;
      paralelo: string;
      inicialTurno: string;
    }
    const combinaciones = new Map<string, Combinacion>();
    for (const fila of estudiantes) {
      const carreraInfo = mapaCarreras.get(normalizar(fila.carrera));
      const turnoId = mapaTurnos.get(normalizar(fila.turno));
      const semestre = MAPA_SEMESTRES[normalizar(fila.semestre)];
      const paralelo = (fila.paralelo || 'A').toUpperCase();

      if (!carreraInfo || !turnoId || !semestre) {
        console.warn(
          `  ! Fila omitida (carrera/turno/semestre no mapeado): ${fila.apellidos_y_nombres}`,
        );
        continue;
      }

      const clave = `${GESTION}|${PERIODO}|${carreraInfo.id}|${semestre}|${turnoId}|${paralelo}`;
      if (!combinaciones.has(clave)) {
        combinaciones.set(clave, {
          carreraId: carreraInfo.id,
          codigoCarrera: carreraInfo.codigo,
          semestre,
          turnoId,
          paralelo,
          inicialTurno: normalizar(fila.turno).charAt(0),
        });
      }
    }

    // 5. Upsert de grupos por combinación
    const mapaGrupos = new Map<string, number>();
    for (const [clave, combo] of combinaciones) {
      const planEstudioId = mapaPlanes.get(combo.carreraId);
      if (!planEstudioId) {
        console.warn(`  ! Carrera ${combo.carreraId} sin plan de estudio; se omite combinación`);
        continue;
      }

      const semestreDosDigitos = String(combo.semestre).padStart(2, '0');
      const codigo = `${combo.codigoCarrera}-${GESTION}-${PERIODO}-${semestreDosDigitos}-${combo.inicialTurno}-${combo.paralelo}`;

      const existente: any[] = await ejecutor.query(
        `SELECT id FROM grupos
         WHERE gestion = $1 AND carrera_id = $2 AND semestre = $3 AND turno_id = $4 AND paralelo = $5 AND periodo_id = $6`,
        [GESTION, combo.carreraId, combo.semestre, combo.turnoId, combo.paralelo, periodoId],
      );

      if (existente.length > 0) {
        const grupoId = existente[0].id;
        await ejecutor.query(
          `UPDATE grupos
           SET codigo = $1, plan_estudio_id = $2, periodo_id = $3, capacidad = $4,
               estado = 'activo', materia_id = NULL, actualizado_en = now()
           WHERE id = $5`,
          [codigo, planEstudioId, periodoId, CAPACIDAD, grupoId],
        );
        mapaGrupos.set(clave, grupoId);
        gruposActualizados++;
      } else {
        const insertado: any[] = await ejecutor.query(
          `INSERT INTO grupos
             (codigo, carrera_id, plan_estudio_id, semestre, turno_id, paralelo, gestion, periodo_id, capacidad, estado)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'activo')
           RETURNING id`,
          [
            codigo,
            combo.carreraId,
            planEstudioId,
            combo.semestre,
            combo.turnoId,
            combo.paralelo,
            GESTION,
            periodoId,
            CAPACIDAD,
          ],
        );
        mapaGrupos.set(clave, insertado[0].id);
        gruposCreados++;
      }
    }

    // 6. Asignación de estudiantes a grupos
    for (const fila of estudiantes) {
      const carreraInfo = mapaCarreras.get(normalizar(fila.carrera));
      const turnoId = mapaTurnos.get(normalizar(fila.turno));
      const semestre = MAPA_SEMESTRES[normalizar(fila.semestre)];
      const paralelo = (fila.paralelo || 'A').toUpperCase();
      if (!carreraInfo || !turnoId || !semestre) {
        continue;
      }

      const estudiante: any[] = await ejecutor.query(
        `SELECT e.id
         FROM estudiantes e
         JOIN personas p ON p.id = e."personaId"
         WHERE p.ci = $1 AND e.carrera_id = $2
         LIMIT 1`,
        [String(fila.ci), carreraInfo.id],
      );
      if (estudiante.length === 0) {
        console.warn(`  ! Estudiante no encontrado (CI ${fila.ci}, carrera ${fila.carrera})`);
        continue;
      }
      const estudianteId = estudiante[0].id;

      const clave = `${GESTION}|${PERIODO}|${carreraInfo.id}|${semestre}|${turnoId}|${paralelo}`;
      const grupoId = mapaGrupos.get(clave);
      if (!grupoId) {
        continue;
      }

      const insertada: any[] = await ejecutor.query(
        `INSERT INTO grupos_estudiantes (grupo_id, "estudianteId")
         SELECT $1, $2
         WHERE NOT EXISTS (
           SELECT 1 FROM grupos_estudiantes WHERE grupo_id = $1 AND "estudianteId" = $2
         )
         RETURNING id`,
        [grupoId, estudianteId],
      );

      if (insertada.length > 0) {
        asignacionesCreadas++;
        await ejecutor.query(
          `INSERT INTO grupos_historial (grupo_id, estudiante_id, accion, detalle)
           VALUES ($1, $2, 'asignado', $3)`,
          [grupoId, estudianteId, `Estudiante ${estudianteId} asignado al grupo ${grupoId}`],
        );
      } else {
        asignacionesExistentes++;
      }
    }

    await ejecutor.commitTransaction();

    console.log('\n=== Resumen ===');
    console.log(`Grupos creados: ${gruposCreados}`);
    console.log(`Grupos actualizados: ${gruposActualizados}`);
    console.log(`Asignaciones creadas: ${asignacionesCreadas}`);
    console.log(`Asignaciones ya existentes: ${asignacionesExistentes}`);
    console.log('\n=== Semilla de grupos completada ===');
  } catch (error) {
    await ejecutor.rollbackTransaction();
    throw error;
  } finally {
    await ejecutor.release();
    await fuenteDatos.destroy();
  }
}

sembrarGrupos().catch((error) => {
  console.error('Error en semilla de grupos:', error);
  process.exit(1);
});
