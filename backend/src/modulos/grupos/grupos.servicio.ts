import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Grupo, EstadoGrupo } from '../../entidades/grupo.entidad';
import { GrupoEstudiante } from '../../entidades/grupo-estudiante.entidad';
import { GrupoHistorial } from '../../entidades/grupo-historial.entidad';
import { CrearGrupoDto } from './dto/crear-grupo.dto';
import { ActualizarGrupoDto } from './dto/actualizar-grupo.dto';
import { GenerarGruposDto } from './dto/generar-grupos.dto';
import { PlanEstudio, EstadoPlanEstudio } from '../../entidades/plan-estudio.entidad';
import { MateriaPlan } from '../../entidades/materia-plan.entidad';
import { Turno } from '../../entidades/turno.entidad';
import { Carrera } from '../../entidades/carrera.entidad';
import { Estudiante, EstadoEstudiante } from '../../entidades/estudiante.entidad';

export interface FiltrosGrupo {
  gestion?: string;
  carreraId?: number;
  semestre?: number;
  turnoId?: number;
  paralelo?: string;
  periodo?: string;
  estado?: EstadoGrupo;
  busqueda?: string;
}

@Injectable()
export class ServicioGrupos {
  constructor(
    @InjectRepository(Grupo)
    private repositorioGrupo: Repository<Grupo>,
    @InjectRepository(GrupoEstudiante)
    private repositorioGrupoEstudiante: Repository<GrupoEstudiante>,
    @InjectRepository(GrupoHistorial)
    private repositorioHistorial: Repository<GrupoHistorial>,
    @InjectRepository(Carrera)
    private repositorioCarrera: Repository<Carrera>,
    @InjectRepository(PlanEstudio)
    private repositorioPlanEstudio: Repository<PlanEstudio>,
    @InjectRepository(Turno)
    private repositorioTurno: Repository<Turno>,
    @InjectRepository(MateriaPlan)
    private repositorioMateriaPlan: Repository<MateriaPlan>,
    @InjectRepository(Estudiante)
    private repositorioEstudiante: Repository<Estudiante>,
    private readonly fuenteDatos: DataSource,
  ) {}

  /** Genera el código de grupo con formato CARRERA-GESTION-PERIODO-SS-T-P. */
  private async generarCodigo(
    carrera: Carrera,
    semestre: number,
    turno: Turno,
    paralelo: string,
    gestion: string,
    periodo: string,
  ): Promise<string> {
    const codigoCarrera = (carrera?.codigo || 'XXX').toUpperCase();
    const periodoNormalizado = (periodo || 'I').trim().toUpperCase();
    const semestreDosDigitos = String(semestre).padStart(2, '0');
    const inicialTurno = (turno?.codigo || 'X').trim().charAt(0).toUpperCase();
    const codigo = `${codigoCarrera}-${gestion}-${periodoNormalizado}-${semestreDosDigitos}-${inicialTurno}-${paralelo}`;

    const existente = await this.repositorioGrupo.findOne({ where: { codigo } });
    if (existente) {
      throw new ConflictException(`El código de grupo ${codigo} ya está en uso`);
    }
    return codigo;
  }

  /** Registra una entrada en el historial del grupo. */
  private async registrarHistorial(
    grupoId: number,
    estudianteId: number | null,
    accion: string,
    detalle: string | null,
  ): Promise<void> {
    await this.repositorioHistorial.save(
      this.repositorioHistorial.create({ grupoId, estudianteId, accion, detalle }),
    );
  }

  private async resolverPlanDeCarrera(
    carreraId: number,
    planEstudioId?: number,
  ): Promise<PlanEstudio> {
    if (planEstudioId) {
      const plan = await this.repositorioPlanEstudio.findOne({ where: { id: planEstudioId } });
      if (!plan) {
        throw new NotFoundException(`Plan de estudio con ID ${planEstudioId} no encontrado`);
      }
      return plan;
    }

    let plan = await this.repositorioPlanEstudio.findOne({
      where: { carreraId, estado: EstadoPlanEstudio.VIGENTE },
      order: { id: 'ASC' },
    });
    if (!plan) {
      plan = await this.repositorioPlanEstudio.findOne({
        where: { carreraId },
        order: { id: 'ASC' },
      });
    }
    if (!plan) {
      throw new BadRequestException(
        `La carrera ${carreraId} no tiene planes de estudio registrados`,
      );
    }
    return plan;
  }

  async crear(crearGrupoDto: CrearGrupoDto): Promise<Grupo> {
    const carrera = await this.repositorioCarrera.findOne({ where: { id: crearGrupoDto.carreraId } });
    if (!carrera) {
      throw new NotFoundException(`Carrera con ID ${crearGrupoDto.carreraId} no encontrada`);
    }

    const turno = await this.repositorioTurno.findOne({ where: { id: crearGrupoDto.turnoId } });
    if (!turno) {
      throw new NotFoundException(`Turno con ID ${crearGrupoDto.turnoId} no encontrado`);
    }

    const plan = await this.resolverPlanDeCarrera(crearGrupoDto.carreraId, crearGrupoDto.planEstudioId);

    const periodo = (crearGrupoDto.periodo || 'I').trim().toUpperCase();

    const existente = await this.repositorioGrupo.findOne({
      where: {
        gestion: crearGrupoDto.gestion,
        carreraId: crearGrupoDto.carreraId,
        periodo,
        semestre: crearGrupoDto.semestre,
        turnoId: crearGrupoDto.turnoId,
        paralelo: crearGrupoDto.paralelo,
      },
    });
    if (existente) {
      throw new ConflictException(
        `Ya existe un grupo para la combinación gestión ${crearGrupoDto.gestion}, periodo ${periodo}, carrera ${carrera.codigo}, semestre ${crearGrupoDto.semestre}, turno ${turno.codigo}, paralelo ${crearGrupoDto.paralelo}`,
      );
    }

    const codigo = await this.generarCodigo(
      carrera,
      crearGrupoDto.semestre,
      turno,
      crearGrupoDto.paralelo,
      crearGrupoDto.gestion,
      periodo,
    );

    const grupo = this.repositorioGrupo.create({
      codigo,
      carreraId: crearGrupoDto.carreraId,
      planEstudioId: plan.id,
      semestre: crearGrupoDto.semestre,
      turnoId: crearGrupoDto.turnoId,
      paralelo: crearGrupoDto.paralelo,
      gestion: crearGrupoDto.gestion,
      periodo,
      capacidad: crearGrupoDto.capacidad ?? 30,
      estado: EstadoGrupo.ACTIVO,
      ...(crearGrupoDto.materiaId ? { materiaId: crearGrupoDto.materiaId } : {}),
    } as any);

    const guardado = await this.repositorioGrupo.save(grupo as any);
    return this.obtenerUno(guardado.id);
  }

  async generarGrupos(
    dto: GenerarGruposDto,
  ): Promise<{ creados: number; existentes: number; mensaje: string }> {
    const plan = await this.repositorioPlanEstudio.findOne({
      where: { id: dto.planEstudioId },
      relations: ['carrera'],
    });
    if (!plan) {
      return { creados: 0, existentes: 0, mensaje: 'No se encontró el plan de estudio' };
    }

    const carrera =
      plan.carrera ?? (await this.repositorioCarrera.findOne({ where: { id: plan.carreraId } }));
    if (!carrera) {
      return { creados: 0, existentes: 0, mensaje: 'No se encontró la carrera del plan de estudio' };
    }

    const capacidad = parseInt(dto.capacidad || '30', 10) || 30;
    const periodo = (dto.periodo || 'I').trim().toUpperCase();
    let creados = 0;
    let existentes = 0;

    for (const semestre of dto.semestres) {
      for (const turnoId of dto.turnoIds) {
        for (const paralelo of dto.paralelos) {
          const existe = await this.repositorioGrupo.findOne({
            where: {
              gestion: dto.gestion,
              carreraId: plan.carreraId,
              periodo,
              semestre,
              turnoId,
              paralelo,
            },
          });
          if (existe) {
            existentes++;
            continue;
          }

          const turno = await this.repositorioTurno.findOne({ where: { id: turnoId } });
          if (!turno) {
            continue;
          }

          const codigo = await this.generarCodigo(carrera, semestre, turno, paralelo, dto.gestion, periodo);

          await this.repositorioGrupo.save(
            this.repositorioGrupo.create({
              codigo,
              carreraId: plan.carreraId,
              planEstudioId: plan.id,
              semestre,
              turnoId,
              paralelo,
              gestion: dto.gestion,
              periodo,
              capacidad,
              estado: EstadoGrupo.ACTIVO,
            }),
          );
          creados++;
        }
      }
    }

    return {
      creados,
      existentes,
      mensaje: `Se crearon ${creados} grupos y ya existían ${existentes}`,
    };
  }

  private async contarInscritos(grupoId: number): Promise<number> {
    return this.repositorioGrupoEstudiante.count({ where: { grupoId } });
  }

  private async contarInscritosPorGrupo(ids: number[]): Promise<Map<number, number>> {
    const mapa = new Map<number, number>();
    if (ids.length === 0) {
      return mapa;
    }
    const filas = await this.repositorioGrupoEstudiante
      .createQueryBuilder('ge')
      .select('ge.grupoId', 'grupoId')
      .addSelect('COUNT(*)', 'inscritos')
      .where('ge.grupoId IN (:...ids)', { ids })
      .groupBy('ge.grupoId')
      .getRawMany();
    for (const fila of filas) {
      mapa.set(Number(fila.grupoId), Number(fila.inscritos));
    }
    return mapa;
  }

  async obtenerTodos(
    pagina = 1,
    limite = 20,
    filtros: FiltrosGrupo = {},
  ): Promise<{ datos: Grupo[]; total: number; pagina: number; limite: number }> {
    const consulta = this.repositorioGrupo
      .createQueryBuilder('grupo')
      .leftJoinAndSelect('grupo.carrera', 'carrera')
      .leftJoinAndSelect('grupo.plan_estudio', 'plan_estudio')
      .leftJoinAndSelect('grupo.turno', 'turno')
      .leftJoinAndSelect('grupo.materia', 'materia');

    if (filtros.gestion) {
      consulta.andWhere('grupo.gestion = :gestion', { gestion: filtros.gestion });
    }
    if (filtros.carreraId) {
      consulta.andWhere('grupo.carreraId = :carreraId', { carreraId: filtros.carreraId });
    }
    if (filtros.semestre) {
      consulta.andWhere('grupo.semestre = :semestre', { semestre: filtros.semestre });
    }
    if (filtros.turnoId) {
      consulta.andWhere('grupo.turnoId = :turnoId', { turnoId: filtros.turnoId });
    }
    if (filtros.paralelo) {
      consulta.andWhere('grupo.paralelo = :paralelo', { paralelo: filtros.paralelo });
    }
    if (filtros.periodo) {
      consulta.andWhere('grupo.periodo = :periodo', { periodo: filtros.periodo });
    }
    if (filtros.estado) {
      consulta.andWhere('grupo.estado = :estado', { estado: filtros.estado });
    }
    if (filtros.busqueda) {
      consulta.andWhere('(grupo.codigo ILIKE :busqueda OR carrera.nombre ILIKE :busqueda)', {
        busqueda: `%${filtros.busqueda}%`,
      });
    }

    const [datos, total] = await consulta
      .orderBy('grupo.gestion', 'DESC')
      .addOrderBy('grupo.periodo', 'ASC')
      .addOrderBy('grupo.semestre', 'ASC')
      .addOrderBy('grupo.paralelo', 'ASC')
      .skip((pagina - 1) * limite)
      .take(limite)
      .getManyAndCount();

    const conteos = await this.contarInscritosPorGrupo(datos.map((grupo) => grupo.id));
    for (const grupo of datos) {
      const inscritos = conteos.get(grupo.id) || 0;
      (grupo as any).inscritos = inscritos;
      (grupo as any).cuposDisponibles = Math.max(grupo.capacidad - inscritos, 0);
    }

    return { datos, total, pagina, limite };
  }

  async obtenerUno(id: number): Promise<Grupo> {
    const grupo = await this.repositorioGrupo.findOne({
      where: { id },
      relations: ['carrera', 'plan_estudio', 'turno', 'materia'],
    });
    if (!grupo) {
      throw new NotFoundException(`Grupo con ID ${id} no encontrado`);
    }
    const inscritos = await this.contarInscritos(id);
    (grupo as any).inscritos = inscritos;
    (grupo as any).cuposDisponibles = Math.max(grupo.capacidad - inscritos, 0);
    return grupo;
  }

  async actualizar(id: number, actualizarGrupoDto: ActualizarGrupoDto): Promise<Grupo> {
    const grupo = await this.repositorioGrupo.findOne({ where: { id } });
    if (!grupo) {
      throw new NotFoundException(`Grupo con ID ${id} no encontrado`);
    }

    const nuevaCombinacion = {
      gestion: actualizarGrupoDto.gestion ?? grupo.gestion,
      carreraId: actualizarGrupoDto.carreraId ?? grupo.carreraId,
      periodo: (actualizarGrupoDto.periodo ?? grupo.periodo ?? 'I').trim().toUpperCase(),
      semestre: actualizarGrupoDto.semestre ?? grupo.semestre,
      turnoId: actualizarGrupoDto.turnoId ?? grupo.turnoId,
      paralelo: actualizarGrupoDto.paralelo ?? grupo.paralelo,
    };

    const combinacionCambia =
      nuevaCombinacion.gestion !== grupo.gestion ||
      nuevaCombinacion.carreraId !== grupo.carreraId ||
      nuevaCombinacion.periodo !== grupo.periodo ||
      nuevaCombinacion.semestre !== grupo.semestre ||
      nuevaCombinacion.turnoId !== grupo.turnoId ||
      nuevaCombinacion.paralelo !== grupo.paralelo;

    if (combinacionCambia) {
      const colision = await this.repositorioGrupo.findOne({ where: nuevaCombinacion });
      if (colision && colision.id !== id) {
        throw new ConflictException(
          'Ya existe otro grupo con la misma gestión, periodo, carrera, semestre, turno y paralelo',
        );
      }

      const carrera = await this.repositorioCarrera.findOne({
        where: { id: nuevaCombinacion.carreraId },
      });
      if (!carrera) {
        throw new NotFoundException(`Carrera con ID ${nuevaCombinacion.carreraId} no encontrada`);
      }
      const turno = await this.repositorioTurno.findOne({ where: { id: nuevaCombinacion.turnoId } });
      if (!turno) {
        throw new NotFoundException(`Turno con ID ${nuevaCombinacion.turnoId} no encontrado`);
      }

      grupo.codigo = await this.generarCodigo(
        carrera,
        nuevaCombinacion.semestre,
        turno,
        nuevaCombinacion.paralelo,
        nuevaCombinacion.gestion,
        nuevaCombinacion.periodo,
      );
    }

    Object.assign(grupo, actualizarGrupoDto);
    grupo.periodo = nuevaCombinacion.periodo;
    await this.repositorioGrupo.save(grupo);
    return this.obtenerUno(id);
  }

  async cambiarEstado(id: number, estado: EstadoGrupo): Promise<Grupo> {
    const grupo = await this.repositorioGrupo.findOne({ where: { id } });
    if (!grupo) {
      throw new NotFoundException(`Grupo con ID ${id} no encontrado`);
    }
    grupo.estado = estado;
    await this.repositorioGrupo.save(grupo);
    await this.registrarHistorial(id, null, 'estado', `Estado cambiado a ${estado}`);
    return this.obtenerUno(id);
  }

  async eliminar(id: number): Promise<void> {
    const grupo = await this.repositorioGrupo.findOne({ where: { id } });
    if (!grupo) {
      throw new NotFoundException(`Grupo con ID ${id} no encontrado`);
    }
    const inscritos = await this.contarInscritos(id);
    if (inscritos > 0) {
      throw new ConflictException(
        `El grupo tiene ${inscritos} estudiante(s) asignado(s) y no puede eliminarse. Ciérrelo (estado 'cerrado') en lugar de borrarlo.`,
      );
    }
    await this.repositorioGrupo.remove(grupo);
  }

  async agregarEstudiante(grupoId: number, estudianteId: number): Promise<GrupoEstudiante> {
    const ejecutor = this.fuenteDatos.createQueryRunner();
    await ejecutor.connect();
    await ejecutor.startTransaction();
    try {
      const grupo = await ejecutor.manager.findOne(Grupo, { where: { id: grupoId } });
      if (!grupo) {
        throw new NotFoundException(`Grupo con ID ${grupoId} no encontrado`);
      }

      const estudiante = await ejecutor.manager.findOne(Estudiante, { where: { id: estudianteId } });
      if (!estudiante) {
        throw new NotFoundException(`Estudiante con ID ${estudianteId} no encontrado`);
      }

      if (estudiante.estado !== EstadoEstudiante.ACTIVO) {
        throw new BadRequestException('El estudiante no está activo');
      }

      if (estudiante.carreraId !== grupo.carreraId) {
        throw new BadRequestException('El estudiante no pertenece a la misma carrera del grupo');
      }

      const duplicado = await ejecutor.manager.findOne(GrupoEstudiante, {
        where: { grupoId, estudianteId },
      });
      if (duplicado) {
        throw new ConflictException('El estudiante ya está asignado a este grupo');
      }

      const inscritos = await ejecutor.manager.count(GrupoEstudiante, { where: { grupoId } });
      if (inscritos >= grupo.capacidad) {
        throw new ConflictException('El grupo alcanzó su capacidad máxima');
      }

      const asignacion = ejecutor.manager.create(GrupoEstudiante, { grupoId, estudianteId });
      const guardada = await ejecutor.manager.save(asignacion);

      await ejecutor.manager.save(
        ejecutor.manager.create(GrupoHistorial, {
          grupoId,
          estudianteId,
          accion: 'asignado',
          detalle: `Estudiante ${estudianteId} asignado al grupo ${grupo.codigo || grupoId}`,
        }),
      );

      await ejecutor.commitTransaction();
      return guardada;
    } catch (error) {
      await ejecutor.rollbackTransaction();
      throw error;
    } finally {
      await ejecutor.release();
    }
  }

  async eliminarEstudiante(grupoId: number, estudianteId: number): Promise<void> {
    const ejecutor = this.fuenteDatos.createQueryRunner();
    await ejecutor.connect();
    await ejecutor.startTransaction();
    try {
      const asignacion = await ejecutor.manager.findOne(GrupoEstudiante, {
        where: { grupoId, estudianteId },
      });
      if (!asignacion) {
        throw new NotFoundException('El estudiante no está asignado a este grupo');
      }

      await ejecutor.manager.remove(asignacion);
      await ejecutor.manager.save(
        ejecutor.manager.create(GrupoHistorial, {
          grupoId,
          estudianteId,
          accion: 'retirado',
          detalle: `Estudiante ${estudianteId} retirado del grupo ${grupoId}`,
        }),
      );

      await ejecutor.commitTransaction();
    } catch (error) {
      await ejecutor.rollbackTransaction();
      throw error;
    } finally {
      await ejecutor.release();
    }
  }

  async trasladarEstudiante(
    grupoId: number,
    estudianteId: number,
    grupoDestinoId: number,
  ): Promise<GrupoEstudiante> {
    const ejecutor = this.fuenteDatos.createQueryRunner();
    await ejecutor.connect();
    await ejecutor.startTransaction();
    try {
      const grupoOrigen = await ejecutor.manager.findOne(Grupo, { where: { id: grupoId } });
      if (!grupoOrigen) {
        throw new NotFoundException(`Grupo de origen con ID ${grupoId} no encontrado`);
      }
      const grupoDestino = await ejecutor.manager.findOne(Grupo, { where: { id: grupoDestinoId } });
      if (!grupoDestino) {
        throw new NotFoundException(`Grupo de destino con ID ${grupoDestinoId} no encontrado`);
      }
      if (grupoDestino.carreraId !== grupoOrigen.carreraId) {
        throw new BadRequestException('El grupo de destino pertenece a otra carrera');
      }

      const asignacion = await ejecutor.manager.findOne(GrupoEstudiante, {
        where: { grupoId, estudianteId },
      });
      if (!asignacion) {
        throw new NotFoundException('El estudiante no está asignado al grupo de origen');
      }

      const duplicado = await ejecutor.manager.findOne(GrupoEstudiante, {
        where: { grupoId: grupoDestinoId, estudianteId },
      });
      if (duplicado) {
        throw new ConflictException('El estudiante ya está asignado al grupo de destino');
      }

      const inscritosDestino = await ejecutor.manager.count(GrupoEstudiante, {
        where: { grupoId: grupoDestinoId },
      });
      if (inscritosDestino >= grupoDestino.capacidad) {
        throw new ConflictException('El grupo de destino alcanzó su capacidad máxima');
      }

      await ejecutor.manager.remove(asignacion);
      const nuevaAsignacion = ejecutor.manager.create(GrupoEstudiante, {
        grupoId: grupoDestinoId,
        estudianteId,
      });
      const guardada = await ejecutor.manager.save(nuevaAsignacion);

      await ejecutor.manager.save(
        ejecutor.manager.create(GrupoHistorial, {
          grupoId,
          estudianteId,
          accion: 'trasladado',
          detalle: `Estudiante ${estudianteId} trasladado al grupo ${grupoDestino.codigo || grupoDestinoId}`,
        }),
      );
      await ejecutor.manager.save(
        ejecutor.manager.create(GrupoHistorial, {
          grupoId: grupoDestinoId,
          estudianteId,
          accion: 'trasladado',
          detalle: `Estudiante ${estudianteId} recibido desde el grupo ${grupoOrigen.codigo || grupoId}`,
        }),
      );

      await ejecutor.commitTransaction();
      return guardada;
    } catch (error) {
      await ejecutor.rollbackTransaction();
      throw error;
    } finally {
      await ejecutor.release();
    }
  }

  async obtenerEstudiantes(grupoId: number): Promise<GrupoEstudiante[]> {
    return this.repositorioGrupoEstudiante
      .createQueryBuilder('ge')
      .leftJoinAndSelect('ge.estudiante', 'estudiante')
      .leftJoinAndSelect('estudiante.persona', 'persona')
      .where('ge.grupoId = :grupoId', { grupoId })
      .orderBy('persona.apellidoPaterno', 'ASC')
      .addOrderBy('persona.apellidoMaterno', 'ASC')
      .addOrderBy('persona.nombres', 'ASC')
      .getMany();
  }

  async obtenerEstadisticasGrupo(
    grupoId: number,
  ): Promise<{ total: number; capacidad: number; cuposDisponibles: number }> {
    const grupo = await this.repositorioGrupo.findOne({ where: { id: grupoId } });
    if (!grupo) {
      throw new NotFoundException(`Grupo con ID ${grupoId} no encontrado`);
    }
    const total = await this.contarInscritos(grupoId);
    return {
      total,
      capacidad: grupo.capacidad,
      cuposDisponibles: Math.max(grupo.capacidad - total, 0),
    };
  }

  async obtenerMaterias(grupoId: number): Promise<any[]> {
    const grupo = await this.repositorioGrupo.findOne({ where: { id: grupoId } });
    if (!grupo) {
      throw new NotFoundException(`Grupo con ID ${grupoId} no encontrado`);
    }
    const filas = await this.repositorioMateriaPlan
      .createQueryBuilder('mp')
      .leftJoinAndSelect('mp.materia', 'materia')
      .where('mp.planEstudioId = :planEstudioId', { planEstudioId: grupo.planEstudioId })
      .andWhere('mp.semestre = :semestre', { semestre: grupo.semestre })
      .orderBy('materia.codigo', 'ASC')
      .getMany();

    return filas
      .filter((fila) => !!fila.materia)
      .map((fila) => ({
        ...fila.materia,
        semestre: fila.semestre,
        horasSemanales: fila.horasSemanales,
      }));
  }

  async obtenerHistorial(grupoId: number): Promise<GrupoHistorial[]> {
    const grupo = await this.repositorioGrupo.findOne({ where: { id: grupoId } });
    if (!grupo) {
      throw new NotFoundException(`Grupo con ID ${grupoId} no encontrado`);
    }
    return this.repositorioHistorial.find({
      where: { grupoId },
      relations: ['estudiante', 'estudiante.persona'],
      order: { creadoEn: 'DESC' },
    });
  }

  async buscarPorCarreraYTurno(
    carreraId: number,
    gestion: string,
    semestre: number,
    turnoId: number,
    periodo?: string,
  ): Promise<Grupo[]> {
    return this.repositorioGrupo.find({
      where: { carreraId, gestion, semestre, turnoId, periodo },
      relations: ['turno', 'carrera', 'plan_estudio', 'materia'],
    });
  }
}
