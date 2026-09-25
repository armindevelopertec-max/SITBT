import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanEstudio, StudyPlanStatus } from '../../entities/plan-estudio.entity';
import { CreateStudyPlanDto } from './dto/create-study-plan.dto';
import { UpdateStudyPlanDto } from './dto/update-study-plan.dto';

@Injectable()
export class StudyPlansService {
  constructor(
    @InjectRepository(PlanEstudio)
    private studyPlanRepository: Repository<PlanEstudio>,
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
      .leftJoinAndSelect('study_plan.career', 'career');

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
      relations: ['career'],
    });
    if (!studyPlan) {
      throw new NotFoundException(`StudyPlan with ID ${id} not found`);
    }
    return studyPlan;
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
      relations: ['career'],
      order: { rm_date: 'DESC' },
    });
  }

  async findActive(): Promise<PlanEstudio[]> {
    return this.studyPlanRepository.find({
      where: { status: StudyPlanStatus.VIGENTE },
      relations: ['career'],
      order: { rm_date: 'DESC' },
    });
  }

  async findCurrentByCareer(careerId: number): Promise<PlanEstudio | null> {
    return this.studyPlanRepository.findOne({
      where: { career_id: careerId, status: StudyPlanStatus.VIGENTE },
      relations: ['career'],
    });
  }
}