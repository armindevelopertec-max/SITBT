import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanEstudio, EstadoPlanEstudio } from '../../entities/plan-estudio.entity';
import { MateriaPlan } from '../../entities/materia-plan.entity';
import { Materia } from '../../entities/materia.entity';
import { CrearPlanEstudioDto } from './dto/crear-plan-estudio.dto';
import { ActualizarPlanEstudioDto } from './dto/actualizar-plan-estudio.dto';

@Injectable()
export class ServicioPlanesEstudio {
  constructor(
    @InjectRepository(PlanEstudio)
    private planEstudioRepository: Repository<PlanEstudio>,
    @InjectRepository(MateriaPlan)
    private materiaPlanRepository: Repository<MateriaPlan>,
    @InjectRepository(Materia)
    private materiaRepository: Repository<Materia>,
  ) {}

  async create(crearPlanEstudioDto: CrearPlanEstudioDto): Promise<PlanEstudio> {
    const studyPlan = this.planEstudioRepository.create(crearPlanEstudioDto);
    return this.planEstudioRepository.save(studyPlan);
  }

  async findAll(
    page = 1,
    limit = 20,
    status?: EstadoPlanEstudio,
    careerId?: number,
  ): Promise<{ data: PlanEstudio[]; total: number; page: number; limit: number }> {
    const query = this.planEstudioRepository
      .createQueryBuilder('study_plan')
      .leftJoinAndSelect('study_plan.carrera', 'career');

    if (status) {
      query.andWhere('study_plan.status = :status', { status });
    }

    if (careerId) {
      query.andWhere('study_plan.career_id = :careerId', { careerId });
    }

    const [data, total] = await query
      .orderBy('study_plan.rm_date', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<PlanEstudio> {
    const studyPlan = await this.planEstudioRepository.findOne({
      where: { id },
      relations: ['carrera'],
    });
    if (!studyPlan) {
      throw new NotFoundException(`Plan de estudio con ID ${id} no encontrado`);
    }
    return studyPlan;
  }

  async findOneWithMaterias(id: number): Promise<any> {
    const studyPlan = await this.findOne(id);
    const materias = await this.getMaterias(id);
    const materiasDisponibles = await this.getMateriasDisponibles();
    return {
      ...studyPlan,
      materias,
      materias_disponibles: materiasDisponibles,
    };
  }

  async update(id: number, actualizarPlanEstudioDto: ActualizarPlanEstudioDto): Promise<PlanEstudio> {
    const studyPlan = await this.findOne(id);
    Object.assign(studyPlan, actualizarPlanEstudioDto);
    return this.planEstudioRepository.save(studyPlan);
  }

  async remove(id: number): Promise<void> {
    const studyPlan = await this.findOne(id);
    await this.planEstudioRepository.remove(studyPlan);
  }

  async findByCareer(careerId: number): Promise<PlanEstudio[]> {
    return this.planEstudioRepository.find({
      where: { career_id: careerId },
      relations: ['carrera'],
      order: { rm_date: 'DESC' },
    });
  }

  async findActive(): Promise<PlanEstudio[]> {
    return this.planEstudioRepository.find({
      where: { status: EstadoPlanEstudio.VIGENTE },
      relations: ['carrera'],
      order: { rm_date: 'DESC' },
    });
  }

  async findCurrentByCareer(careerId: number): Promise<PlanEstudio[]> {
    return this.planEstudioRepository.find({
      where: { career_id: careerId, status: EstadoPlanEstudio.VIGENTE },
      relations: ['carrera'],
      order: { rm_date: 'DESC' },
    });
  }

  async addMateria(planId: number, subjectId: number, semester: number, weeklyHours: number, prerequisiteId?: number): Promise<MateriaPlan> {
    const existing = await this.materiaPlanRepository.findOne({
      where: { study_plan_id: planId, subject_id: subjectId },
    });
    if (existing) {
      throw new NotFoundException('Esta materia ya existe en el plan de estudio');
    }
    const materiaPlan = this.materiaPlanRepository.create({
      study_plan_id: planId,
      subject_id: subjectId,
      semester,
      weekly_hours: weeklyHours,
      prerequisite_id: prerequisiteId ?? null,
    });
    return this.materiaPlanRepository.save(materiaPlan);
  }

  async removeMateria(materiaPlanId: number): Promise<void> {
    const materiaPlan = await this.materiaPlanRepository.findOne({
      where: { id: materiaPlanId },
    });
    if (!materiaPlan) {
      throw new NotFoundException(`MateriaPlan con ID ${materiaPlanId} no encontrado`);
    }
    await this.materiaPlanRepository.remove(materiaPlan);
  }

  async updateMateria(materiaPlanId: number, semester: number, weeklyHours: number, prerequisiteId?: number): Promise<MateriaPlan> {
    const materiaPlan = await this.materiaPlanRepository.findOne({
      where: { id: materiaPlanId },
    });
    if (!materiaPlan) {
      throw new NotFoundException(`MateriaPlan con ID ${materiaPlanId} no encontrado`);
    }
    materiaPlan.semester = semester;
    materiaPlan.weekly_hours = weeklyHours;
    materiaPlan.prerequisite_id = prerequisiteId ?? null;
    return this.materiaPlanRepository.save(materiaPlan);
  }

  async getMaterias(planId: number): Promise<any[]> {
    const results = await this.materiaPlanRepository.query(`
      SELECT 
        ps.id,
        ps.study_plan_id,
        ps.subject_id,
        ps.semester,
        ps.weekly_hours,
        ps.prerequisite_id,
        s.id as materia_id,
        s.code as materia_code,
        s.name as materia_name,
        prereq.id as prerequisite_id,
        prereq.code as prerequisite_code,
        prereq.name as prerequisite_name
      FROM plan_subjects ps
      JOIN subjects s ON s.id = ps.subject_id
      LEFT JOIN subjects prereq ON prereq.id = ps.prerequisite_id
      WHERE ps.study_plan_id = $1
      ORDER BY ps.semester, s.code
    `, [planId]);
    return results;
  }

  async getMateriasDisponibles(): Promise<Materia[]> {
    return this.materiaRepository.find({
      order: { name: 'ASC' },
    });
  }
}