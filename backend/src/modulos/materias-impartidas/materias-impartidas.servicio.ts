import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  MateriaImpartida,
  EstadoMateriaImpartida,
} from '../../entidades/materia-impartida.entidad';
import {
  InscripcionMateria,
  EstadoInscripcionMateria,
} from '../../entidades/inscripcion-materia.entidad';
import {
  LibroCalificaciones,
  EstadoLibro,
} from '../../entidades/libro-calificaciones.entidad';
import {
  CierreAcademico,
  AccionCierreAcademico,
} from '../../entidades/cierre-academico.entidad';
import {
  Calificacion,
  EstadoRegistroNota,
  EstadoCalificacion2T,
  EstadoRevisionCalificacion,
} from '../../entidades/calificacion.entidad';
import { AuditoriaCalificacion } from '../../entidades/auditoria-calificacion.entidad';
import {
  AsignacionDocente,
  EstadoAsignacionDocente,
} from '../../entidades/asignacion-docente.entidad';
import { Grupo, EstadoGrupo } from '../../entidades/grupo.entidad';
import { GrupoEstudiante } from '../../entidades/grupo-estudiante.entidad';
import { MateriaPlan } from '../../entidades/materia-plan.entidad';
import { Materia } from '../../entidades/materia.entidad';
import { Estudiante, EstadoEstudiante } from '../../entidades/estudiante.entidad';
import { Personal, EstadoPersonal } from '../../entidades/personal.entidad';
import { Periodo } from '../../entidades/periodo.entidad';
import { ServicioCalculoAcademico } from './calculo-academico.servicio';
import { CrearMateriaImpartidaDto } from './dto/crear-materia-impartida.dto';
import { GenerarMateriasImpartidasDto } from './dto/generar-materias-impartidas.dto';
import { AsignarDocenteDto } from './dto/asignar-docente.dto';
import { RegistrarCalificacionDto } from './dto/registrar-calificacion.dto';
import { CerrarLibroDto } from './dto/cerrar-libro.dto';
import { ReabrirLibroDto } from './dto/reabrir-libro.dto';
import { InscribirEstudianteDto } from './dto/inscribir-estudiante.dto';

export interface FiltrosMateriaImpartida {
  gestion?: string;
  periodoId?: number;
  carreraId?: number;
  semestre?: number;
  paralelo?: string;
  turnoId?: number;
  docenteId?: number;
  estadoMateria?: EstadoMateriaImpartida;
  estadoNotas?: EstadoLibro;
  busqueda?: string;
}

@Injectable()
export class ServicioMateriasImpartidas {
  constructor(
    @InjectRepository(MateriaImpartida)
    private repositorioMateriaImpartida: Repository<MateriaImpartida>,
    @InjectRepository(InscripcionMateria)
    private repositorioInscripcionMateria: Repository<InscripcionMateria>,
    @InjectRepository(LibroCalificaciones)
    private repositorioLibro: Repository<LibroCalificaciones>,
    @InjectRepository(CierreAcademico)
    private repositorioCierre: Repository<CierreAcademico>,
    @InjectRepository(Calificacion)
    private repositorioCalificacion: Repository<Calificacion>,
    @InjectRepository(AuditoriaCalificacion)
    private repositorioAuditoria: Repository<AuditoriaCalificacion>,
    @InjectRepository(AsignacionDocente)
    private repositorioAsignacion: Repository<AsignacionDocente>,
    @InjectRepository(Grupo)
    private repositorioGrupo: Repository<Grupo>,
    @InjectRepository(GrupoEstudiante)
    private repositorioGrupoEstudiante: Repository<GrupoEstudiante>,
    @InjectRepository(MateriaPlan)
    private repositorioMateriaPlan: Repository<MateriaPlan>,
    @InjectRepository(Materia)
    private repositorioMateria: Repository<Materia>,
    @InjectRepository(Estudiante)
    private repositorioEstudiante: Repository<Estudiante>,
    @InjectRepository(Personal)
    private repositorioPersonal: Repository<Personal>,
    @InjectRepository(Periodo)
    private repositorioPeriodo: Repository<Periodo>,
    private readonly calculo: ServicioCalculoAcademico,
  ) {}

  // ---------------------------------------------------------------------------
  // Generación y creación
  // ---------------------------------------------------------------------------

  async generar(
    dto: GenerarMateriasImpartidasDto,
  ): Promise<{ creados: number; existentes: number; inscripciones: number; mensaje: string }> {
    const periodo = await this.repositorioPeriodo.findOne({
      where: { id: dto.periodoId },
      relations: ['gestion'],
    });
    if (!periodo) {
      throw new NotFoundException(`Periodo con ID ${dto.periodoId} no encontrado`);
    }
    const gestion = periodo.gestion?.anio;
    if (!gestion) {
      throw new BadRequestException('El periodo no tiene una gestión asociada');
    }

    const filtroGrupo: Record<string, unknown> = { periodoId: periodo.id };
    if (dto.carreraId) {
      filtroGrupo.carreraId = dto.carreraId;
    }
    if (dto.grupoId) {
      filtroGrupo.id = dto.grupoId;
    }
    const grupos = await this.repositorioGrupo.find({ where: filtroGrupo });
    if (grupos.length === 0) {
      return { creados: 0, existentes: 0, inscripciones: 0, mensaje: 'No hay grupos en el periodo indicado' };
    }

    let creados = 0;
    let existentes = 0;
    let inscripciones = 0;

    for (const grupo of grupos) {
      const materiasPlan = await this.repositorioMateriaPlan.find({
        where: { planEstudioId: grupo.planEstudioId, semestre: grupo.semestre },
      });

      for (const materiaPlan of materiasPlan) {
        let materiaImpartida = await this.repositorioMateriaImpartida.findOne({
          where: { grupoId: grupo.id, materiaId: materiaPlan.materiaId, periodoId: periodo.id },
        });

        if (materiaImpartida) {
          existentes++;
        } else {
          materiaImpartida = await this.repositorioMateriaImpartida.save(
            this.repositorioMateriaImpartida.create({
              grupoId: grupo.id,
              materiaId: materiaPlan.materiaId,
              materiaPlanId: materiaPlan.id,
              periodoId: periodo.id,
              gestion,
              estado: EstadoMateriaImpartida.ACTIVA,
            }),
          );
          creados++;
        }

        await this.asegurarLibro(materiaImpartida.id);
        inscripciones += await this.sincronizarInscripciones(materiaImpartida.id, grupo.id);
      }
    }

    return {
      creados,
      existentes,
      inscripciones,
      mensaje: `Se generaron ${creados} materia(s) impartida(s); ${existentes} ya existían; ${inscripciones} inscripción(es) de estudiantes`,
    };
  }

  async crear(dto: CrearMateriaImpartidaDto): Promise<MateriaImpartida> {
    const grupo = await this.repositorioGrupo.findOne({
      where: { id: dto.grupoId },
      relations: ['periodo', 'periodo.gestion'],
    });
    if (!grupo) {
      throw new NotFoundException(`Grupo con ID ${dto.grupoId} no encontrado`);
    }
    const materia = await this.repositorioMateria.findOne({ where: { id: dto.materiaId } });
    if (!materia) {
      throw new NotFoundException(`Materia con ID ${dto.materiaId} no encontrada`);
    }

    const materiaPlan = await this.repositorioMateriaPlan.findOne({
      where: { planEstudioId: grupo.planEstudioId, semestre: grupo.semestre, materiaId: materia.id },
    });
    if (!materiaPlan && !dto.materiaPlanId) {
      throw new BadRequestException(
        'La asignatura no pertenece al plan de estudio ni al semestre del grupo seleccionado',
      );
    }

    const existente = await this.repositorioMateriaImpartida.findOne({
      where: { grupoId: grupo.id, materiaId: materia.id, periodoId: grupo.periodoId },
    });
    if (existente) {
      throw new ConflictException('Ya existe una materia impartida para esa asignatura, grupo y periodo');
    }

    const gestion = grupo.periodo?.gestion?.anio || grupo.gestion;
    const creada = await this.repositorioMateriaImpartida.save(
      this.repositorioMateriaImpartida.create({
        grupoId: grupo.id,
        materiaId: materia.id,
        materiaPlanId: dto.materiaPlanId ?? materiaPlan?.id ?? null,
        periodoId: grupo.periodoId,
        gestion,
        estado: EstadoMateriaImpartida.ACTIVA,
      }),
    );

    await this.asegurarLibro(creada.id);
    await this.sincronizarInscripciones(creada.id, grupo.id);
    return this.obtenerUno(creada.id);
  }

  // ---------------------------------------------------------------------------
  // Consultas
  // ---------------------------------------------------------------------------

  async listar(
    pagina = 1,
    limite = 20,
    filtros: FiltrosMateriaImpartida = {},
  ): Promise<{ datos: any[]; total: number; pagina: number; limite: number }> {
    const consulta = this.repositorioMateriaImpartida
      .createQueryBuilder('mi')
      .leftJoinAndSelect('mi.materia', 'materia')
      .leftJoinAndSelect('mi.grupo', 'grupo')
      .leftJoinAndSelect('grupo.carrera', 'carrera')
      .leftJoinAndSelect('grupo.turno', 'turno')
      .leftJoinAndSelect('grupo.periodo', 'periodo')
      .leftJoinAndSelect('periodo.gestion', 'gestion');

    if (filtros.gestion) {
      consulta.andWhere('mi.gestion = :gestion', { gestion: filtros.gestion });
    }
    if (filtros.periodoId) {
      consulta.andWhere('mi.periodoId = :periodoId', { periodoId: filtros.periodoId });
    }
    if (filtros.carreraId) {
      consulta.andWhere('grupo.carreraId = :carreraId', { carreraId: filtros.carreraId });
    }
    if (filtros.semestre) {
      consulta.andWhere('grupo.semestre = :semestre', { semestre: filtros.semestre });
    }
    if (filtros.paralelo) {
      consulta.andWhere('grupo.paralelo = :paralelo', { paralelo: filtros.paralelo });
    }
    if (filtros.turnoId) {
      consulta.andWhere('grupo.turnoId = :turnoId', { turnoId: filtros.turnoId });
    }
    if (filtros.estadoMateria) {
      consulta.andWhere('mi.estado = :estadoMateria', { estadoMateria: filtros.estadoMateria });
    }
    if (filtros.busqueda) {
      consulta.andWhere('(materia.codigo ILIKE :busqueda OR materia.nombre ILIKE :busqueda OR grupo.codigo ILIKE :busqueda)', {
        busqueda: `%${filtros.busqueda}%`,
      });
    }
    if (filtros.docenteId) {
      consulta.innerJoin(
        'asignaciones_docentes',
        'adf',
        'adf.materia_impartida_id = mi.id AND adf.estado = :estadoActivo AND adf.docente_id = :docenteId',
        { estadoActivo: EstadoAsignacionDocente.ACTIVO, docenteId: filtros.docenteId },
      );
    }
    if (filtros.estadoNotas) {
      consulta.innerJoin(
        'libros_calificaciones',
        'lic',
        'lic.materia_impartida_id = mi.id AND lic.estado = :estadoNotas',
        { estadoNotas: filtros.estadoNotas },
      );
    }

    const [filas, total] = await consulta
      .orderBy('gestion.anio', 'DESC')
      .addOrderBy('grupo.semestre', 'ASC')
      .addOrderBy('materia.codigo', 'ASC')
      .skip((pagina - 1) * limite)
      .take(limite)
      .getManyAndCount();

    const datos = await this.enriquecer(filas);
    return { datos, total, pagina, limite };
  }

  private async enriquecer(filas: MateriaImpartida[]): Promise<any[]> {
    const ids = filas.map((f) => f.id);
    if (ids.length === 0) {
      return [];
    }

    const inscritosPorMateria = await this.contarInscritos(ids);
    const libros = await this.repositorioLibro.find({ where: { materiaImpartidaId: In(ids) } });
    const libroPorMateria = new Map(libros.map((l) => [l.materiaImpartidaId, l]));

    const asignaciones = await this.repositorioAsignacion.find({
      where: { materiaImpartidaId: In(ids), estado: EstadoAsignacionDocente.ACTIVO },
      relations: ['docente', 'docente.persona'],
    });
    const asignacionesPorMateria = new Map<number, AsignacionDocente[]>();
    for (const asignacion of asignaciones) {
      if (asignacion.materiaImpartidaId == null) continue;
      const lista = asignacionesPorMateria.get(asignacion.materiaImpartidaId) || [];
      lista.push(asignacion);
      asignacionesPorMateria.set(asignacion.materiaImpartidaId, lista);
    }

    return filas.map((fila) => {
      const activas = asignacionesPorMateria.get(fila.id) || [];
      const libro = libroPorMateria.get(fila.id);
      let estadoDocente: string;
      if (activas.length === 0) {
        estadoDocente = 'pendiente';
      } else if (activas.length === 1) {
        estadoDocente = 'asignado';
      } else {
        estadoDocente = 'requiere_revision';
      }
      return {
        id: fila.id,
        materiaId: fila.materiaId,
        materia: fila.materia,
        grupoId: fila.grupoId,
        grupo: fila.grupo,
        gestion: fila.gestion,
        periodoId: fila.periodoId,
        estado: fila.estado,
        inscritos: inscritosPorMateria.get(fila.id) || 0,
        docente: activas[0]?.docente || null,
        estadoDocente,
        estadoNotas: libro?.estado || 'sin_iniciar',
        libroId: libro?.id || null,
      };
    });
  }

  private async contarInscritos(ids: number[]): Promise<Map<number, number>> {
    const mapa = new Map<number, number>();
    if (ids.length === 0) return mapa;
    const filas = await this.repositorioInscripcionMateria
      .createQueryBuilder('im')
      .select('im.materiaImpartidaId', 'materiaImpartidaId')
      .addSelect('COUNT(*)', 'total')
      .where('im.materiaImpartidaId IN (:...ids)', { ids })
      .andWhere('im.estado != :retirado', { retirado: EstadoInscripcionMateria.RETIRADO })
      .groupBy('im.materiaImpartidaId')
      .getRawMany();
    for (const fila of filas) {
      mapa.set(Number(fila.materiaImpartidaId), Number(fila.total));
    }
    return mapa;
  }

  async obtenerUno(id: number): Promise<any> {
    const entidad = await this.repositorioMateriaImpartida.findOne({
      where: { id },
      relations: [
        'materia',
        'grupo',
        'grupo.carrera',
        'grupo.plan_estudio',
        'grupo.turno',
        'grupo.periodo',
        'grupo.periodo.gestion',
      ],
    });
    if (!entidad) {
      throw new NotFoundException(`Materia impartida con ID ${id} no encontrada`);
    }
    const [enriquecida] = await this.enriquecer([entidad]);
    const libro = await this.asegurarLibro(id);
    return { ...enriquecida, libro };
  }

  async obtenerAsignaciones(id: number): Promise<AsignacionDocente[]> {
    await this.obtenerEntidad(id);
    return this.repositorioAsignacion.find({
      where: { materiaImpartidaId: id },
      relations: ['docente', 'docente.persona'],
      order: { creadoEn: 'DESC' },
    });
  }

  async obtenerEstudiantes(id: number): Promise<any[]> {
    await this.obtenerEntidad(id);
    const inscripciones = await this.repositorioInscripcionMateria.find({
      where: { materiaImpartidaId: id },
      relations: ['estudiante', 'estudiante.persona'],
      order: { creadoEn: 'ASC' },
    });
    return inscripciones.map((inscripcion) => ({
      inscripcionMateriaId: inscripcion.id,
      estudianteId: inscripcion.estudianteId,
      estudiante: inscripcion.estudiante,
      estadoInscripcion: inscripcion.estado,
    }));
  }

  // ---------------------------------------------------------------------------
  // Docentes
  // ---------------------------------------------------------------------------

  async asignarDocente(id: number, dto: AsignarDocenteDto): Promise<MateriaImpartida> {
    const materiaImpartida = await this.obtenerEntidad(id);
    const libro = await this.asegurarLibro(id);
    if (libro.estado === EstadoLibro.CERRADO) {
      throw new BadRequestException('El libro de calificaciones está cerrado; reábralo antes de cambiar al docente');
    }

    const docente = await this.repositorioPersonal.findOne({
      where: { id: dto.docenteId },
      relations: ['persona'],
    });
    if (!docente) {
      throw new NotFoundException(`Docente con ID ${dto.docenteId} no encontrado`);
    }
    if (docente.estado !== EstadoPersonal.ACTIVO) {
      throw new BadRequestException('El docente seleccionado no está activo');
    }

    const hoy = new Date().toISOString().slice(0, 10);

    const activas = await this.repositorioAsignacion.find({
      where: { materiaImpartidaId: id, estado: EstadoAsignacionDocente.ACTIVO },
    });
    for (const anterior of activas) {
      if (anterior.docenteId === dto.docenteId) {
        throw new ConflictException('El docente ya está asignado a esta materia impartida');
      }
      anterior.estado = EstadoAsignacionDocente.FINALIZADO;
      anterior.fechaFin = anterior.fechaFin || hoy;
      await this.repositorioAsignacion.save(anterior);
    }

    await this.repositorioAsignacion.save(
      this.repositorioAsignacion.create({
        docenteId: dto.docenteId,
        materiaId: materiaImpartida.materiaId,
        grupoId: materiaImpartida.grupoId,
        materiaImpartidaId: id,
        gestion: materiaImpartida.gestion,
        fechaInicio: dto.fechaInicio || hoy,
        fechaFin: dto.fechaFin || null,
        cargaHoraria: dto.cargaHoraria ?? null,
        observacion: dto.observacion || null,
        estado: EstadoAsignacionDocente.ACTIVO,
      }),
    );

    return this.obtenerUno(id);
  }

  async finalizarAsignacion(id: number, asignacionId: number): Promise<MateriaImpartida> {
    await this.obtenerEntidad(id);
    const asignacion = await this.repositorioAsignacion.findOne({
      where: { id: asignacionId, materiaImpartidaId: id },
    });
    if (!asignacion) {
      throw new NotFoundException(`Asignación con ID ${asignacionId} no encontrada`);
    }
    asignacion.estado = EstadoAsignacionDocente.FINALIZADO;
    asignacion.fechaFin = asignacion.fechaFin || new Date().toISOString().slice(0, 10);
    await this.repositorioAsignacion.save(asignacion);
    return this.obtenerUno(id);
  }

  // ---------------------------------------------------------------------------
  // Estudiantes inscritos
  // ---------------------------------------------------------------------------

  async inscribirEstudiante(id: number, dto: InscribirEstudianteDto): Promise<any> {
    const materiaImpartida = await this.obtenerEntidad(id);
    const estudiante = await this.repositorioEstudiante.findOne({ where: { id: dto.estudianteId } });
    if (!estudiante) {
      throw new NotFoundException(`Estudiante con ID ${dto.estudianteId} no encontrado`);
    }
    const existente = await this.repositorioInscripcionMateria.findOne({
      where: { materiaImpartidaId: id, estudianteId: dto.estudianteId },
    });
    if (existente) {
      if (existente.estado === EstadoInscripcionMateria.RETIRADO) {
        existente.estado = EstadoInscripcionMateria.CURSANDO;
        await this.repositorioInscripcionMateria.save(existente);
      }
      return this.obtenerEstudiantes(id);
    }
    await this.repositorioInscripcionMateria.save(
      this.repositorioInscripcionMateria.create({
        estudianteId: dto.estudianteId,
        materiaImpartidaId: id,
        estado: EstadoInscripcionMateria.CURSANDO,
      }),
    );
    void materiaImpartida;
    return this.obtenerEstudiantes(id);
  }

  async retirarEstudiante(id: number, inscripcionMateriaId: number): Promise<any> {
    await this.obtenerEntidad(id);
    const inscripcion = await this.repositorioInscripcionMateria.findOne({
      where: { id: inscripcionMateriaId, materiaImpartidaId: id },
    });
    if (!inscripcion) {
      throw new NotFoundException('La inscripción indicada no existe en esta materia impartida');
    }
    const calificacion = await this.repositorioCalificacion.findOne({
      where: { inscripcionMateriaId: inscripcion.id },
    });
    if (calificacion) {
      inscripcion.estado = EstadoInscripcionMateria.RETIRADO;
      await this.repositorioInscripcionMateria.save(inscripcion);
    } else {
      await this.repositorioInscripcionMateria.remove(inscripcion);
    }
    return this.obtenerEstudiantes(id);
  }

  async sincronizarEstudiantesDeMateria(id: number): Promise<{ creadas: number }> {
    const materiaImpartida = await this.obtenerEntidad(id);
    const creadas = await this.sincronizarInscripciones(id, materiaImpartida.grupoId);
    return { creadas };
  }

  private async sincronizarInscripciones(materiaImpartidaId: number, grupoId: number): Promise<number> {
    const miembros = await this.repositorioGrupoEstudiante.find({ where: { grupoId } });
    if (miembros.length === 0) {
      return 0;
    }
    const existentes = await this.repositorioInscripcionMateria.find({
      where: { materiaImpartidaId },
    });
    const set = new Set(existentes.map((i) => i.estudianteId));
    const nuevos = miembros
      .filter((m) => !set.has(m.estudianteId))
      .map((m) =>
        this.repositorioInscripcionMateria.create({
          estudianteId: m.estudianteId,
          materiaImpartidaId,
          estado: EstadoInscripcionMateria.CURSANDO,
        }),
      );
    if (nuevos.length > 0) {
      await this.repositorioInscripcionMateria.save(nuevos);
    }
    return nuevos.length;
  }

  // ---------------------------------------------------------------------------
  // Libro de calificaciones
  // ---------------------------------------------------------------------------

  async obtenerLibro(id: number): Promise<any> {
    const materiaImpartida = await this.obtenerUno(id);
    const libro = await this.asegurarLibro(id);
    const inscripciones = await this.repositorioInscripcionMateria.find({
      where: { materiaImpartidaId: id },
      relations: ['estudiante', 'estudiante.persona'],
      order: { creadoEn: 'ASC' },
    });
    const calificaciones = await this.repositorioCalificacion.find({
      where: { inscripcionMateriaId: In(inscripciones.map((i) => i.id)) },
    });
    const porInscripcion = new Map(calificaciones.map((c) => [c.inscripcionMateriaId, c]));

    const filas = inscripciones.map((inscripcion) => ({
      inscripcionMateriaId: inscripcion.id,
      estudianteId: inscripcion.estudianteId,
      estudiante: inscripcion.estudiante,
      estadoInscripcion: inscripcion.estado,
      calificacion: porInscripcion.get(inscripcion.id) || null,
    }));

    return { materiaImpartida, libro, filas };
  }

  async registrarCalificacion(
    id: number,
    dto: RegistrarCalificacionDto,
    usuarioId: number | null,
  ): Promise<Calificacion> {
    const libro = await this.asegurarLibro(id);
    if (libro.estado === EstadoLibro.CERRADO) {
      throw new BadRequestException('El libro está cerrado; reábralo con autorización para modificar notas');
    }

    const inscripcion = await this.repositorioInscripcionMateria.findOne({
      where: { id: dto.inscripcionMateriaId, materiaImpartidaId: id },
    });
    if (!inscripcion) {
      throw new NotFoundException('La inscripción indicada no pertenece a esta materia impartida');
    }

    let calificacion = await this.repositorioCalificacion.findOne({
      where: { inscripcionMateriaId: inscripcion.id },
    });
    const esNueva = !calificacion;
    if (!calificacion) {
      calificacion = this.repositorioCalificacion.create({
        inscripcionMateriaId: inscripcion.id,
        estadoRevision: EstadoRevisionCalificacion.EN_REGISTRO,
        creadoPorId: usuarioId ?? null,
      });
    }
    const anterior = { ...calificacion };

    if (dto.parcial1 !== undefined) {
      calificacion.parcial1 = dto.parcial1;
      if (dto.parcial1Estado === undefined) {
        calificacion.parcial1Estado = EstadoRegistroNota.REGISTRADO;
      }
    }
    if (dto.parcial1Estado !== undefined) {
      calificacion.parcial1Estado = dto.parcial1Estado;
      if (dto.parcial1Estado !== EstadoRegistroNota.REGISTRADO) {
        calificacion.parcial1 = null;
      }
    }
    if (dto.parcial2 !== undefined) {
      calificacion.parcial2 = dto.parcial2;
      if (dto.parcial2Estado === undefined) {
        calificacion.parcial2Estado = EstadoRegistroNota.REGISTRADO;
      }
    }
    if (dto.parcial2Estado !== undefined) {
      calificacion.parcial2Estado = dto.parcial2Estado;
      if (dto.parcial2Estado !== EstadoRegistroNota.REGISTRADO) {
        calificacion.parcial2 = null;
      }
    }

    // Validar habilitación al segundo turno antes de aplicarlo.
    const preliminar = this.calculo.calcular({
      parcial1: calificacion.parcial1,
      parcial1Estado: calificacion.parcial1Estado,
      parcial2: calificacion.parcial2,
      parcial2Estado: calificacion.parcial2Estado,
      estado2T: EstadoCalificacion2T.NO_CORRESPONDE,
      notaSegundaTurno: null,
    });
    const aplica2T =
      dto.estado2T === EstadoCalificacion2T.CALIFICADO ||
      dto.estado2T === EstadoCalificacion2T.AUSENTE ||
      dto.estado2T === EstadoCalificacion2T.JUSTIFICADO;
    if (aplica2T && !preliminar.habilitado2T) {
      throw new BadRequestException(
        'El estudiante no está habilitado para el segundo turno (promedio fuera del rango 40-60)',
      );
    }

    if (dto.estado2T !== undefined) {
      calificacion.estado2T = dto.estado2T;
    }
    if (dto.notaSegundaTurno !== undefined) {
      calificacion.notaSegundaTurno = dto.notaSegundaTurno;
      if (dto.estado2T === undefined) {
        calificacion.estado2T = EstadoCalificacion2T.CALIFICADO;
      }
    }

    const resultado = this.calculo.calcular({
      parcial1: calificacion.parcial1,
      parcial1Estado: calificacion.parcial1Estado,
      parcial2: calificacion.parcial2,
      parcial2Estado: calificacion.parcial2Estado,
      estado2T: calificacion.estado2T,
      notaSegundaTurno: calificacion.notaSegundaTurno,
    });

    calificacion.promedioFinal = resultado.promedioSemestral;
    calificacion.estadoRegular = resultado.estadoRegular;
    calificacion.observacion = resultado.observacion;
    calificacion.aptoSegundaTurno = resultado.habilitado2T;
    calificacion.estado2T = resultado.estado2T;
    calificacion.notaDefinitiva = resultado.notaDefinitiva;
    calificacion.estadoDefinitivo = resultado.estadoDefinitivo;
    calificacion.estadoRevision = EstadoRevisionCalificacion.EN_REGISTRO;
    calificacion.registradoPor = usuarioId ?? calificacion.registradoPor;
    calificacion.modificadoPorId = usuarioId ?? null;

    const docenteActivo = await this.repositorioAsignacion.findOne({
      where: { materiaImpartidaId: id, estado: EstadoAsignacionDocente.ACTIVO },
    });
    if (docenteActivo) {
      calificacion.docenteId = docenteActivo.docenteId;
    }

    const guardada = await this.repositorioCalificacion.save(calificacion);

    await this.registrarAuditoria(id, anterior, guardada, dto.motivo || null, usuarioId, esNueva);

    if (libro.estado === EstadoLibro.BORRADOR || libro.estado === EstadoLibro.REABIERTO) {
      libro.estado = EstadoLibro.EN_REGISTRO;
      await this.repositorioLibro.save(libro);
    }

    return guardada;
  }

  async calcularVista(id: number, inscripcionMateriaId: number): Promise<any> {
    await this.obtenerEntidad(id);
    const inscripcion = await this.repositorioInscripcionMateria.findOne({
      where: { id: inscripcionMateriaId, materiaImpartidaId: id },
    });
    if (!inscripcion) {
      throw new NotFoundException('La inscripción indicada no pertenece a esta materia impartida');
    }
    const calificacion = await this.repositorioCalificacion.findOne({
      where: { inscripcionMateriaId: inscripcion.id },
    });
    return this.calculo.calcular({
      parcial1: calificacion?.parcial1 ?? null,
      parcial1Estado: calificacion?.parcial1Estado ?? EstadoRegistroNota.SIN_REGISTRAR,
      parcial2: calificacion?.parcial2 ?? null,
      parcial2Estado: calificacion?.parcial2Estado ?? EstadoRegistroNota.SIN_REGISTRAR,
      estado2T: calificacion?.estado2T ?? EstadoCalificacion2T.NO_CORRESPONDE,
      notaSegundaTurno: calificacion?.notaSegundaTurno ?? null,
    });
  }

  async obtenerPendientes(id: number): Promise<any[]> {
    const { libro, filas } = await this.obtenerLibro(id);
    void libro;
    return filas
      .filter((fila) => {
        if (fila.estadoInscripcion === EstadoInscripcionMateria.RETIRADO) return false;
        const c = fila.calificacion;
        if (!c) return true;
        return c.estadoDefinitivo == null || c.estadoDefinitivo === 'pendiente';
      })
      .map((fila) => ({
        inscripcionMateriaId: fila.inscripcionMateriaId,
        estudiante: fila.estudiante,
        calificacion: fila.calificacion,
      }));
  }

  async cerrarLibro(id: number, dto: CerrarLibroDto, usuarioId: number | null): Promise<any> {
    const libro = await this.asegurarLibro(id);
    if (libro.estado === EstadoLibro.CERRADO) {
      throw new BadRequestException('El libro ya está cerrado');
    }
    const pendientes = await this.obtenerPendientes(id);
    if (pendientes.length > 0) {
      throw new BadRequestException(
        `No se puede cerrar: ${pendientes.length} estudiante(s) sin resultado definitivo`,
      );
    }

    libro.estado = EstadoLibro.CERRADO;
    libro.cerradoEn = new Date();
    libro.cerradoPor = usuarioId ?? null;
    if (dto.observacion !== undefined) {
      libro.observacion = dto.observacion || null;
    }
    await this.repositorioLibro.save(libro);

    await this.repositorioCalificacion
      .createQueryBuilder()
      .update(Calificacion)
      .set({ estadoRevision: EstadoRevisionCalificacion.CERRADO })
      .where('inscripcionMateriaId IN (SELECT id FROM inscripciones_materia WHERE materia_impartida_id = :id)', { id })
      .execute();

    await this.repositorioCierre.save(
      this.repositorioCierre.create({
        libroId: libro.id,
        accion: AccionCierreAcademico.CERRAR,
        motivo: dto.observacion || null,
        autorizadoPor: usuarioId ?? null,
      }),
    );

    return this.obtenerLibro(id);
  }

  async reabrirLibro(id: number, dto: ReabrirLibroDto, usuarioId: number | null): Promise<any> {
    const libro = await this.asegurarLibro(id);
    if (libro.estado !== EstadoLibro.CERRADO) {
      throw new BadRequestException('Solo se pueden reabrir libros cerrados');
    }
    libro.estado = EstadoLibro.REABIERTO;
    libro.cerradoEn = null;
    libro.cerradoPor = null;
    await this.repositorioLibro.save(libro);

    await this.repositorioCierre.save(
      this.repositorioCierre.create({
        libroId: libro.id,
        accion: AccionCierreAcademico.REABRIR,
        motivo: dto.motivo,
        autorizadoPor: usuarioId ?? null,
      }),
    );

    return this.obtenerLibro(id);
  }

  async obtenerHistorial(id: number): Promise<any> {
    await this.obtenerEntidad(id);
    const libro = await this.asegurarLibro(id);
    const inscripciones = await this.repositorioInscripcionMateria.find({
      where: { materiaImpartidaId: id },
    });
    const idsInscripciones = inscripciones.map((i) => i.id);
    const calificaciones =
      idsInscripciones.length > 0
        ? await this.repositorioCalificacion.find({
            where: { inscripcionMateriaId: In(idsInscripciones) },
          })
        : [];
    const idsCalificaciones = calificaciones.map((c) => c.id);
    const auditoria =
      idsCalificaciones.length > 0
        ? await this.repositorioAuditoria.find({
            where: { calificacionId: In(idsCalificaciones) },
            relations: ['usuario', 'usuario.persona'],
            order: { cambiadoEn: 'DESC' },
          })
        : [];
    const cierres = await this.repositorioCierre.find({
      where: { libroId: libro.id },
      relations: ['autorizador', 'autorizador.persona'],
      order: { creadoEn: 'DESC' },
    });
    return {
      auditoria: auditoria.map((registro) => ({
        ...registro,
        usuario: this.sanearUsuario(registro.usuario),
      })),
      cierres: cierres.map((cierre) => ({
        ...cierre,
        autorizador: this.sanearUsuario(cierre.autorizador),
      })),
    };
  }

  /** Evita exponer el hash de la contraseña en las respuestas del historial. */
  private sanearUsuario(usuario: any): any {
    if (!usuario) return usuario;
    const { contrasenaHash, ...resto } = usuario;
    void contrasenaHash;
    return resto;
  }

  // ---------------------------------------------------------------------------
  // Utilidades
  // ---------------------------------------------------------------------------

  private async obtenerEntidad(id: number): Promise<MateriaImpartida> {
    const entidad = await this.repositorioMateriaImpartida.findOne({ where: { id } });
    if (!entidad) {
      throw new NotFoundException(`Materia impartida con ID ${id} no encontrada`);
    }
    return entidad;
  }

  private async asegurarLibro(materiaImpartidaId: number): Promise<LibroCalificaciones> {
    let libro = await this.repositorioLibro.findOne({ where: { materiaImpartidaId } });
    if (!libro) {
      libro = await this.repositorioLibro.save(
        this.repositorioLibro.create({
          materiaImpartidaId,
          estado: EstadoLibro.BORRADOR,
        }),
      );
    }
    return libro;
  }

  private async registrarAuditoria(
    materiaImpartidaId: number,
    anterior: Partial<Calificacion>,
    actual: Calificacion,
    motivo: string | null,
    usuarioId: number | null,
    esNueva: boolean,
  ): Promise<void> {
    void materiaImpartidaId;
    const campos: (keyof Calificacion)[] = [
      'parcial1',
      'parcial1Estado',
      'parcial2',
      'parcial2Estado',
      'promedioFinal',
      'observacion',
      'estadoRegular',
      'estado2T',
      'notaSegundaTurno',
      'notaDefinitiva',
      'estadoDefinitivo',
    ];
    const registros: AuditoriaCalificacion[] = [];
    for (const campo of campos) {
      const valorAnterior = esNueva ? null : anterior[campo];
      const valorNuevo = actual[campo];
      const serializadoAnterior = valorAnterior == null ? null : String(valorAnterior);
      const serializadoNuevo = valorNuevo == null ? null : String(valorNuevo);
      if (serializadoAnterior !== serializadoNuevo) {
        registros.push(
          this.repositorioAuditoria.create({
            calificacionId: actual.id,
            campoCambiado: String(campo),
            valorAnterior: serializadoAnterior,
            valorNuevo: serializadoNuevo,
            motivo,
            usuarioId,
          }),
        );
      }
    }
    if (registros.length > 0) {
      await this.repositorioAuditoria.save(registros);
    }
  }
}
