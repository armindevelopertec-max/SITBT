import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Estudiante, StudentStatus } from '../../entities/estudiante.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Estudiante)
    private studentRepository: Repository<Estudiante>,
  ) {}

  async create(createStudentDto: CreateStudentDto): Promise<Estudiante> {
    const student = this.studentRepository.create(createStudentDto);
    return this.studentRepository.save(student);
  }

  async findAll(
    page = 1,
    limit = 20,
    status?: StudentStatus,
    careerId?: number,
  ): Promise<{ data: Estudiante[]; total: number; page: number; limit: number }> {
    const query = this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.person', 'person')
      .leftJoinAndSelect('student.career', 'career')
      .leftJoinAndSelect('student.study_plan', 'study_plan');

    if (status) {
      query.andWhere('student.status = :status', { status });
    }

    if (careerId) {
      query.andWhere('student.career_id = :careerId', { careerId });
    }

    const [data, total] = await query
      .orderBy('student.inscription_code', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Estudiante> {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: ['person', 'career', 'study_plan'],
    });
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    return student;
  }

  async findByInscriptionCode(code: string): Promise<Estudiante> {
    const student = await this.studentRepository.findOne({
      where: { inscription_code: code },
      relations: ['person', 'career', 'study_plan'],
    });
    if (!student) {
      throw new NotFoundException(`Student with inscription code ${code} not found`);
    }
    return student;
  }

  async update(id: number, updateStudentDto: UpdateStudentDto): Promise<Estudiante> {
    const student = await this.findOne(id);
    Object.assign(student, updateStudentDto);
    return this.studentRepository.save(student);
  }

  async remove(id: number): Promise<void> {
    const student = await this.findOne(id);
    await this.studentRepository.remove(student);
  }

  async findByCareer(careerId: number, gestion?: string): Promise<Estudiante[]> {
    const query = this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.person', 'person')
      .where('student.career_id = :careerId', { careerId });

    if (gestion) {
      query.andWhere('student.admission_gestion = :gestion', { gestion });
    }

    return query.orderBy('student.inscription_code', 'ASC').getMany();
  }

  async findActive(): Promise<Estudiante[]> {
    return this.studentRepository.find({
      where: { status: StudentStatus.ACTIVO },
      relations: ['person', 'career'],
      order: { inscription_code: 'ASC' },
    });
  }

  async countByStatus(careerId?: number): Promise<{ status: string; count: number }[]> {
    const query = this.studentRepository
      .createQueryBuilder('student')
      .select('student.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('student.status');

    if (careerId) {
      query.where('student.career_id = :careerId', { careerId });
    }

    return query.getRawMany();
  }

  async getStudentStats(): Promise<{
    total: number;
    active: number;
    graduated: number;
    frozen: number;
  }> {
    const stats = await this.studentRepository
      .createQueryBuilder('student')
      .select('student.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('student.status')
      .getRawMany();

    const result = { total: 0, active: 0, graduated: 0, frozen: 0 };
    stats.forEach((s) => {
      result.total += parseInt(s.count);
      if (s.status === StudentStatus.ACTIVO) result.active = parseInt(s.count);
      if (s.status === StudentStatus.EGRESADO || s.status === StudentStatus.TITULADO) result.graduated += parseInt(s.count);
      if (s.status === StudentStatus.CONGELADO) result.frozen = parseInt(s.count);
    });

    return result;
  }
}