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
    semester?: number,
  ): Promise<{ data: Grupo[]; total: number; page: number; limit: number }> {
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
      query.andWhere('group.career_id = :careerId', { careerId });
    }

    if (semester) {
      query.andWhere('group.semester = :semester', { semester });
    }

    const [data, total] = await query
      .orderBy('group.gestion', 'DESC')
      .addOrderBy('group.periodo', 'ASC')
      .addOrderBy('group.semester', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
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
      group_id: groupId,
      student_id: studentId,
    });
    return this.grupoEstudianteRepository.save(groupStudent);
  }

  async removeStudent(groupId: number, studentId: number): Promise<void> {
    const groupStudent = await this.grupoEstudianteRepository.findOne({
      where: { group_id: groupId, student_id: studentId },
    });
    if (groupStudent) {
      await this.grupoEstudianteRepository.remove(groupStudent);
    }
  }

  async getStudents(groupId: number): Promise<GrupoEstudiante[]> {
    return this.grupoEstudianteRepository.find({
      where: { group_id: groupId },
      relations: ['student', 'student.person'],
    });
  }

  async findByCareerAndShift(
    careerId: number,
    gestion: string,
    semester: number,
    shiftId: number,
    periodo?: string,
  ): Promise<Grupo[]> {
    return this.grupoRepository.find({
      where: { career_id: careerId, gestion, semester, shift_id: shiftId, periodo },
      relations: ['turno'],
    });
  }

  async getGroupStats(groupId: number): Promise<{ total: number; capacity: number }> {
    const group = await this.findOne(groupId);
    const count = await this.grupoEstudianteRepository.count({
      where: { group_id: groupId },
    });
    return { total: count, capacity: group.capacity };
  }

  async generateGroups(dto: GenerarGruposDto): Promise<{ created: number; message: string }> {
    try {
      const { gestion, periodo, shift_ids, parallels, study_plan_id } = dto;
      const capacidad = parseInt(dto.capacidad || '30');

      const plan = await this.planEstudioRepository.findOne({
        where: { id: study_plan_id },
        relations: ['carrera'],
      });

      if (!plan) {
        return { created: 0, message: 'No se encontró el plan de estudio' };
      }

      const materias = await this.materiaPlanRepository
        .createQueryBuilder('mp')
        .leftJoinAndSelect('mp.materia', 'materia')
        .where('mp.study_plan_id = :studyPlanId', { studyPlanId: study_plan_id })
        .orderBy('mp.semester', 'ASC')
        .addOrderBy('materia.code', 'ASC')
        .getMany();

      if (materias.length === 0) {
        return { created: 0, message: 'No se encontraron materias en el plan de estudio' };
      }

      const gruposCreados: Grupo[] = [];

      for (const materia of materias) {
        for (const shiftId of shift_ids) {
          for (const paralelo of parallels) {
            const existe = await this.grupoRepository.findOne({
              where: {
                study_plan_id: materia.study_plan_id,
                subject_id: materia.subject_id,
                shift_id: shiftId,
                parallel: paralelo,
                gestion,
                periodo,
              },
            });

            if (!existe) {
              const shift = await this.shiftRepository.findOne({ where: { id: shiftId } });
              const materiaCode = materia.materia?.code || materia.subject_id.toString();
              const carreraCode = plan.carrera?.code || 'XXX';
              const shiftCode = shift?.code || 'X';

              const code = `${materiaCode}-${carreraCode}-${shiftCode}-${paralelo}-${gestion}-${periodo}`;

              const grupo = this.grupoRepository.create({
                code,
                career_id: plan.career_id,
                study_plan_id: materia.study_plan_id,
                subject_id: materia.subject_id,
                semester: materia.semester,
                shift_id: shiftId,
                parallel: paralelo,
                gestion,
                periodo,
                capacity: capacidad,
              });
              const saved = await this.grupoRepository.save(grupo);
              gruposCreados.push(saved);
            }
          }
        }
      }

      return {
        created: gruposCreados.length,
        message: `Se crearon ${gruposCreados.length} grupos para ${materias.length} materias`,
      };
    } catch (error) {
      console.error('Error in generateGroups:', error);
      throw error;
    }
  }
}