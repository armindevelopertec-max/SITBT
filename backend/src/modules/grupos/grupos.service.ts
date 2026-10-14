import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grupo } from '../../entities/grupo.entity';
import { GrupoEstudiante } from '../../entities/grupo-estudiante.entity';
import { CrearGrupoDto } from './dto/crear-grupo.dto';
import { ActualizarGrupoDto } from './dto/actualizar-grupo.dto';
import { GenerarGruposDto } from './dto/generar-grupos.dto';
import { PlanEstudio, EstadoPlanEstudio } from '../../entities/plan-estudio.entity';
import { MateriaPlan } from '../../entities/materia-plan.entity';
import { Turno } from '../../entities/turno.entity';

@Injectable()
export class ServicioGrupos {
  constructor(
    @InjectRepository(Grupo)
    private grupoRepository: Repository<Grupo>,
    @InjectRepository(GrupoEstudiante)
    private grupoEstudianteRepository: Repository<GrupoEstudiante>,
    @InjectRepository(PlanEstudio)
    private planEstudioRepository: Repository<PlanEstudio>,
    @InjectRepository(MateriaPlan)
    private materiaPlanRepository: Repository<MateriaPlan>,
    @InjectRepository(Turno)
    private shiftRepository: Repository<Turno>,
  ) {}

  async create(crearGrupoDto: CrearGrupoDto): Promise<Grupo> {
    const group = this.grupoRepository.create(crearGrupoDto);
    return this.grupoRepository.save(group);
  }

  async findAll(
    page = 1,
    limit = 20,
    gestion?: string,
    careerId?: number,
    semestre?: number,
  ): Promise<{ datos: Grupo[]; total: number; pagina: number; limite: number }> {
    const query = this.grupoRepository
      .createQueryBuilder('group')
      .leftJoinAndSelect('group.carrera', 'career')
      .leftJoinAndSelect('group.plan_estudio', 'study_plan')
      .leftJoinAndSelect('group.turno', 'shift')
      .leftJoinAndSelect('group.materia', 'materia');

    if (gestion) {
      query.andWhere('group.gestion = :gestion', { gestion });
    }

    if (careerId) {
      query.andWhere('group.carreraId = :careerId', { careerId });
    }

    if (semestre) {
      query.andWhere('group.semestre = :semestre', { semestre: semestre });
    }

    const [data, total] = await query
      .orderBy('group.gestion', 'DESC')
      .addOrderBy('group.periodo', 'ASC')
      .addOrderBy('group.semestre', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { datos: data, total, pagina: page, limite: limit };
  }

  async findOne(id: number): Promise<Grupo> {
    const group = await this.grupoRepository.findOne({
      where: { id },
      relations: ['carrera', 'plan_estudio', 'turno', 'materia'],
    });
    if (!group) {
      throw new NotFoundException(`Grupo con ID ${id} no encontrado`);
    }
    return group;
  }

  async update(id: number, actualizarGrupoDto: ActualizarGrupoDto): Promise<Grupo> {
    const group = await this.findOne(id);
    Object.assign(group, actualizarGrupoDto);
    return this.grupoRepository.save(group);
  }

  async remove(id: number): Promise<void> {
    const group = await this.findOne(id);
    await this.grupoRepository.remove(group);
  }

  async addStudent(groupId: number, studentId: number): Promise<GrupoEstudiante> {
    const groupStudent = this.grupoEstudianteRepository.create({
      grupoId: groupId,
      estudianteId: studentId,
    });
    return this.grupoEstudianteRepository.save(groupStudent);
  }

  async removeStudent(groupId: number, studentId: number): Promise<void> {
    const groupStudent = await this.grupoEstudianteRepository.findOne({
      where: { grupoId: groupId, estudianteId: studentId },
    });
    if (groupStudent) {
      await this.grupoEstudianteRepository.remove(groupStudent);
    }
  }

  async getStudents(groupId: number): Promise<GrupoEstudiante[]> {
    return this.grupoEstudianteRepository.find({
      where: { grupoId: groupId },
      relations: ['estudiante', 'estudiante.persona'],
    });
  }

  async findByCareerAndShift(
    careerId: number,
    gestion: string,
    semestre: number,
    shiftId: number,
    periodo?: string,
  ): Promise<Grupo[]> {
    return this.grupoRepository.find({
      where: { carreraId: careerId, gestion, semestre, turnoId: shiftId, periodo },
      relations: ['turno'],
    });
  }

  async getGroupStats(groupId: number): Promise<{ total: number; capacity: number }> {
    const group = await this.findOne(groupId);
    const count = await this.grupoEstudianteRepository.count({
      where: { grupoId: groupId },
    });
    return { total: count, capacity: group.capacidad };
  }

  async generateGroups(dto: GenerarGruposDto): Promise<{ creados: number; mensaje: string }> {
    try {
      const { gestion, periodo, turnoIds, paralelos, planEstudioId } = dto;
      const capacidad = parseInt(dto.capacidad || '30');

      const plan = await this.planEstudioRepository.findOne({
        where: { id: planEstudioId },
        relations: ['carrera'],
      });

      if (!plan) {
        return { creados: 0, mensaje: 'No se encontró el plan de estudio' };
      }

      const materias = await this.materiaPlanRepository
        .createQueryBuilder('mp')
        .leftJoinAndSelect('mp.materia', 'materia')
        .where('mp.planEstudioId = :studyPlanId', { studyPlanId: planEstudioId })
        .orderBy('mp.semestre', 'ASC')
        .addOrderBy('materia.codigo', 'ASC')
        .getMany();

      if (materias.length === 0) {
        return { creados: 0, mensaje: 'No se encontraron materias en el plan de estudio' };
      }

      const gruposCreados: Grupo[] = [];

      for (const materia of materias) {
        for (const shiftId of turnoIds) {
          for (const paralelo of paralelos) {
            const existe = await this.grupoRepository.findOne({
              where: {
                planEstudioId: materia.planEstudioId,
                materiaId: materia.materiaId,
                turnoId: shiftId,
                paralelo: paralelo,
                gestion,
                periodo,
              },
            });

            if (!existe) {
              const shift = await this.shiftRepository.findOne({ where: { id: shiftId } });
              const materiaCode = materia.materia?.codigo || materia.materiaId.toString();
              const carreraCode = plan.carrera?.codigo || 'XXX';
              const shiftCode = shift?.codigo || 'X';

              const code = `${materiaCode}-${carreraCode}-${shiftCode}-${paralelo}-${gestion}-${periodo}`;

              const grupo = this.grupoRepository.create({
                codigo: code,
                carreraId: plan.carreraId,
                planEstudioId: materia.planEstudioId,
                materiaId: materia.materiaId,
                semestre: materia.semestre,
                turnoId: shiftId,
                paralelo: paralelo,
                gestion,
                periodo,
                capacidad: capacidad,
              } as any);
              const saved = await this.grupoRepository.save(grupo as any);
              gruposCreados.push(saved);
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