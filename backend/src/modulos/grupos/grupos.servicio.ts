import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grupo } from '../../entidades/grupo.entidad';
import { GrupoEstudiante } from '../../entidades/grupo-estudiante.entidad';
import { CrearGrupoDto } from './dto/crear-grupo.dto';
import { ActualizarGrupoDto } from './dto/actualizar-grupo.dto';
import { GenerarGruposDto } from './dto/generar-grupos.dto';
import { PlanEstudio, EstadoPlanEstudio } from '../../entidades/plan-estudio.entidad';
import { MateriaPlan } from '../../entidades/materia-plan.entidad';
import { Turno } from '../../entidades/turno.entidad';

@Injectable()
export class ServicioGrupos {
  constructor(
    @InjectRepository(Grupo)
    private repositorioGrupo: Repository<Grupo>,
    @InjectRepository(GrupoEstudiante)
    private repositorioGrupoEstudiante: Repository<GrupoEstudiante>,
    @InjectRepository(PlanEstudio)
    private repositorioPlanEstudio: Repository<PlanEstudio>,
    @InjectRepository(MateriaPlan)
    private repositorioMateriaPlan: Repository<MateriaPlan>,
    @InjectRepository(Turno)
    private repositorioTurno: Repository<Turno>,
  ) {}

  async crear(crearGrupoDto: CrearGrupoDto): Promise<Grupo> {
    const grupo = this.repositorioGrupo.create(crearGrupoDto);
    return this.repositorioGrupo.save(grupo);
  }

  async obtenerTodos(
    pagina = 1,
    limite = 20,
    gestion?: string,
    carreraId?: number,
    semestre?: number,
  ): Promise<{ datos: Grupo[]; total: number; pagina: number; limite: number }> {
    const consulta = this.repositorioGrupo
      .createQueryBuilder('grupo')
      .leftJoinAndSelect('grupo.carrera', 'carrera')
      .leftJoinAndSelect('grupo.plan_estudio', 'plan_estudio')
      .leftJoinAndSelect('grupo.turno', 'turno')
      .leftJoinAndSelect('grupo.materia', 'materia');

    if (gestion) {
      consulta.andWhere('grupo.gestion = :gestion', { gestion });
    }

    if (carreraId) {
      consulta.andWhere('grupo.carreraId = :carreraId', { carreraId });
    }

    if (semestre) {
      consulta.andWhere('grupo.semestre = :semestre', { semestre });
    }

    const [datos, total] = await consulta
      .orderBy('grupo.gestion', 'DESC')
      .addOrderBy('grupo.periodo', 'ASC')
      .addOrderBy('grupo.semestre', 'ASC')
      .skip((pagina - 1) * limite)
      .take(limite)
      .getManyAndCount();

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
    return grupo;
  }

  async actualizar(id: number, actualizarGrupoDto: ActualizarGrupoDto): Promise<Grupo> {
    const grupo = await this.obtenerUno(id);
    Object.assign(grupo, actualizarGrupoDto);
    return this.repositorioGrupo.save(grupo);
  }

  async eliminar(id: number): Promise<void> {
    const grupo = await this.obtenerUno(id);
    await this.repositorioGrupo.remove(grupo);
  }

  async agregarEstudiante(grupoId: number, estudianteId: number): Promise<GrupoEstudiante> {
    const grupoEstudiante = this.repositorioGrupoEstudiante.create({
      grupoId,
      estudianteId,
    });
    return this.repositorioGrupoEstudiante.save(grupoEstudiante);
  }

  async eliminarEstudiante(grupoId: number, estudianteId: number): Promise<void> {
    const grupoEstudiante = await this.repositorioGrupoEstudiante.findOne({
      where: { grupoId, estudianteId },
    });
    if (grupoEstudiante) {
      await this.repositorioGrupoEstudiante.remove(grupoEstudiante);
    }
  }

  async obtenerEstudiantes(grupoId: number): Promise<GrupoEstudiante[]> {
    return this.repositorioGrupoEstudiante.find({
      where: { grupoId },
      relations: ['estudiante', 'estudiante.persona'],
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
      relations: ['turno'],
    });
  }

  async obtenerEstadisticasGrupo(grupoId: number): Promise<{ total: number; capacity: number }> {
    const grupo = await this.obtenerUno(grupoId);
    const conteo = await this.repositorioGrupoEstudiante.count({
      where: { grupoId },
    });
    return { total: conteo, capacity: grupo.capacidad };
  }

  async generarGrupos(dto: GenerarGruposDto): Promise<{ creados: number; mensaje: string }> {
    try {
      const { gestion, periodo, turnoIds, paralelos, planEstudioId } = dto;
      const capacidad = parseInt(dto.capacidad || '30');

      const plan = await this.repositorioPlanEstudio.findOne({
        where: { id: planEstudioId },
        relations: ['carrera'],
      });

      if (!plan) {
        return { creados: 0, mensaje: 'No se encontró el plan de estudio' };
      }

      const materias = await this.repositorioMateriaPlan
        .createQueryBuilder('mp')
        .leftJoinAndSelect('mp.materia', 'materia')
        .where('mp.planEstudioId = :planEstudioId', { planEstudioId })
        .orderBy('mp.semestre', 'ASC')
        .addOrderBy('materia.codigo', 'ASC')
        .getMany();

      if (materias.length === 0) {
        return { creados: 0, mensaje: 'No se encontraron materias en el plan de estudio' };
      }

      const gruposCreados: Grupo[] = [];

      for (const materia of materias) {
        for (const turnoId of turnoIds) {
          for (const paralelo of paralelos) {
            const existe = await this.repositorioGrupo.findOne({
              where: {
                planEstudioId: materia.planEstudioId,
                materiaId: materia.materiaId,
                turnoId,
                paralelo,
                gestion,
                periodo,
              },
            });

            if (!existe) {
              const turno = await this.repositorioTurno.findOne({ where: { id: turnoId } });
              const codigoMateria = materia.materia?.codigo || materia.materiaId.toString();
              const codigoCarrera = plan.carrera?.codigo || 'XXX';
              const codigoTurno = turno?.codigo || 'X';

              const codigo = `${codigoMateria}-${codigoCarrera}-${codigoTurno}-${paralelo}-${gestion}-${periodo}`;

              const grupo = this.repositorioGrupo.create({
                codigo,
                carreraId: plan.carreraId,
                planEstudioId: materia.planEstudioId,
                materiaId: materia.materiaId,
                semestre: materia.semestre,
                turnoId,
                paralelo,
                gestion,
                periodo,
                capacidad,
              } as any);
              const guardado = await this.repositorioGrupo.save(grupo as any);
              gruposCreados.push(guardado);
            }
          }
        }
      }

      return {
        creados: gruposCreados.length,
        mensaje: `Se crearon ${gruposCreados.length} grupos para ${materias.length} materias`,
      };
    } catch (error) {
      console.error('Error al generar grupos:', error);
      throw error;
    }
  }
}
