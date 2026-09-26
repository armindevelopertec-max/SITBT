import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanEstudio, StudyPlanStatus } from '../../entities/plan-estudio.entity';
import { MateriaPlan } from '../../entities/materia-plan.entity';
import { Materia } from '../../entities/materia.entity';
import { CreateStudyPlanDto } from './dto/create-study-plan.dto';
import { UpdateStudyPlanDto } from './dto/update-study-plan.dto';

@Injectable()
export class StudyPlansService {
  constructor(
    @InjectRepository(PlanEstudio)
    private studyPlanRepository: Repository<PlanEstudio>,
    @InjectRepository(MateriaPlan)
    private materiaPlanRepository: Repository<MateriaPlan>,
    @InjectRepository(Materia)
    private materiaRepository: Repository<Materia>,
  ) {}

  async create(createStudyPlanDto: CreateStudyPlanDto): Promise<PlanEstudio> {
    const studyPlan = this.studyPlanRepository.create(createStudyPlanDto);
    return this.studyPlanRepository.save(studyPlan);
  }

  async findAll(
    page = 1,
    limit = 20,
    status?: StudyPlanStatus,
    careerId?: number,
  ): Promise<{ data: PlanEstudio[]; total: number; page: number; limit: number }> {
    const query = this.studyPlanRepository
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
    const studyPlan = await this.studyPlanRepository.findOne({
      where: { id },
      relations: ['carrera'],
    });
    if (!studyPlan) {
      throw new NotFoundException(`StudyPlan with ID ${id} not found`);
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

  async update(id: number, updateStudyPlanDto: UpdateStudyPlanDto): Promise<PlanEstudio> {
    const studyPlan = await this.findOne(id);
    Object.assign(studyPlan, updateStudyPlanDto);
    return this.studyPlanRepository.save(studyPlan);
  }

  async remove(id: number): Promise<void> {
    const studyPlan = await this.findOne(id);
    await this.studyPlanRepository.remove(studyPlan);
  }

  async findByCareer(careerId: number): Promise<PlanEstudio[]> {
    return this.studyPlanRepository.find({
      where: { career_id: careerId },
      relations: ['carrera'],
      order: { rm_date: 'DESC' },
    });
  }

  async findActive(): Promise<PlanEstudio[]> {
    return this.studyPlanRepository.find({
      where: { status: StudyPlanStatus.VIGENTE },
      relations: ['carrera'],
      order: { rm_date: 'DESC' },
    });
  }

  async findCurrentByCareer(careerId: number): Promise<PlanEstudio | null> {
    return this.studyPlanRepository.findOne({
      where: { career_id: careerId, status: StudyPlanStatus.VIGENTE },
      relations: ['carrera'],
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
      throw new NotFoundException(`MateriaPlan with ID ${materiaPlanId} not found`);
    }
    await this.materiaPlanRepository.remove(materiaPlan);
  }

  async updateMateria(materiaPlanId: number, semester: number, weeklyHours: number, prerequisiteId?: number): Promise<MateriaPlan> {
    const materiaPlan = await this.materiaPlanRepository.findOne({
      where: { id: materiaPlanId },
    });
    if (!materiaPlan) {
      throw new NotFoundException(`MateriaPlan with ID ${materiaPlanId} not found`);
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
        ps.code,
        s.id as "materia.id",
        s.code as "materia.code",
        s.name as "materia.name",
        s.created_at as "materia.created_at",
        s.updated_at as "materia.updated_at",
        prereq.id as "prerequisite.id",
        prereq.code as "prerequisite.code",
        prereq.name as "prerequisite.name",
        prereq_plan.code as "prerequisite_plan_code"
      FROM plan_subjects ps
      JOIN subjects s ON s.id = ps.subject_id
      LEFT JOIN subjects prereq ON prereq.id = ps.prerequisite_id
      LEFT JOIN plan_subjects prereq_plan ON prereq_plan.subject_id = ps.prerequisite_id AND prereq_plan.study_plan_id = ps.study_plan_id
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