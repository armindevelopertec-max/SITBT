import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConvalidacionEstudiante, ConvalidationStatus, ConvalidationType } from '../../entities/convalidacion-estudiante.entity';
import { CreateConvalidationDto } from './dto/create-convalidation.dto';
import { UpdateConvalidationDto } from './dto/update-convalidation.dto';

@Injectable()
export class ConvalidationsService {
  constructor(
    @InjectRepository(ConvalidacionEstudiante)
    private convalidationRepository: Repository<ConvalidacionEstudiante>,
  ) {}

  async create(createDto: CreateConvalidationDto): Promise<ConvalidacionEstudiante> {
    const convalidation = this.convalidationRepository.create(createDto);
    return this.convalidationRepository.save(convalidation);
  }

  async findAll(
    page = 1,
    limit = 20,
    status?: ConvalidationStatus,
    type?: ConvalidationType,
    studentId?: number,
  ): Promise<{ data: ConvalidacionEstudiante[]; total: number; page: number; limit: number }> {
    const query = this.convalidationRepository
      .createQueryBuilder('convalidation')
      .leftJoinAndSelect('convalidation.student', 'student')
      .leftJoinAndSelect('student.person', 'person')
      .leftJoinAndSelect('convalidation.target_subject', 'subject')
      .leftJoinAndSelect('convalidation.equivalence', 'equivalence')
      .leftJoinAndSelect('convalidation.approver', 'approver');

    if (status) {
      query.andWhere('convalidation.status = :status', { status });
    }

    if (type) {
      query.andWhere('convalidation.type = :type', { type });
    }

    if (studentId) {
      query.andWhere('convalidation.student_id = :studentId', { studentId });
    }

    const [data, total] = await query
      .orderBy('convalidation.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<ConvalidacionEstudiante> {
    const convalidation = await this.convalidationRepository.findOne({
      where: { id },
      relations: ['student', 'student.person', 'target_subject', 'equivalence', 'approver'],
    });
    if (!convalidation) {
      throw new NotFoundException(`Convalidation with ID ${id} not found`);
    }
    return convalidation;
  }

  async update(id: number, updateDto: UpdateConvalidationDto): Promise<ConvalidacionEstudiante> {
    const convalidation = await this.findOne(id);
    Object.assign(convalidation, updateDto);
    return this.convalidationRepository.save(convalidation);
  }

  async remove(id: number): Promise<void> {
    const convalidation = await this.findOne(id);
    await this.convalidationRepository.remove(convalidation);
  }

  async findByStudent(studentId: number): Promise<ConvalidacionEstudiante[]> {
    return this.convalidationRepository.find({
      where: { student_id: studentId },
      relations: ['target_subject', 'equivalence', 'approver'],
      order: { created_at: 'DESC' },
    });
  }

  async approve(id: number, approvedBy: number, resolutionNumber?: string, resolutionDate?: Date): Promise<ConvalidacionEstudiante> {
    const convalidation = await this.findOne(id);
    convalidation.status = ConvalidationStatus.APROBADA;
    convalidation.approved_by = approvedBy;
    if (resolutionNumber) convalidation.resolution_number = resolutionNumber;
    if (resolutionDate) convalidation.resolution_date = resolutionDate;
    return this.convalidationRepository.save(convalidation);
  }

  async reject(id: number): Promise<ConvalidacionEstudiante> {
    const convalidation = await this.findOne(id);
    convalidation.status = ConvalidationStatus.RECHAZADA;
    return this.convalidationRepository.save(convalidation);
  }

  async getPending(): Promise<ConvalidacionEstudiante[]> {
    return this.convalidationRepository.find({
      where: { status: ConvalidationStatus.PENDIENTE },
      relations: ['student', 'student.person', 'target_subject'],
      order: { created_at: 'ASC' },
    });
  }
}