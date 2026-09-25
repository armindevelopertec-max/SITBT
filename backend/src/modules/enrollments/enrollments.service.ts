import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inscripcion, EnrollmentStatus } from '../../entities/inscripcion.entity';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Inscripcion)
    private enrollmentRepository: Repository<Inscripcion>,
  ) {}

  async create(createEnrollmentDto: CreateEnrollmentDto): Promise<Inscripcion> {
    const existing = await this.enrollmentRepository.findOne({
      where: {
        student_id: createEnrollmentDto.student_id,
        subject_id: createEnrollmentDto.subject_id,
        gestion: createEnrollmentDto.gestion,
      },
    });

    if (existing) {
      throw new BadRequestException('Student already enrolled in this subject for this gestion');
    }

    const enrollment = this.enrollmentRepository.create(createEnrollmentDto);
    return this.enrollmentRepository.save(enrollment);
  }

  async findAll(
    page = 1,
    limit = 20,
    gestion?: string,
    status?: EnrollmentStatus,
    studentId?: number,
  ): Promise<{ data: Inscripcion[]; total: number; page: number; limit: number }> {
    const query = this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.student', 'student')
      .leftJoinAndSelect('student.person', 'person')
      .leftJoinAndSelect('enrollment.subject', 'subject')
      .leftJoinAndSelect('enrollment.group', 'group');

    if (gestion) {
      query.andWhere('enrollment.gestion = :gestion', { gestion });
    }

    if (status) {
      query.andWhere('enrollment.status = :status', { status });
    }

    if (studentId) {
      query.andWhere('enrollment.student_id = :studentId', { studentId });
    }

    const [data, total] = await query
      .orderBy('enrollment.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Inscripcion> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id },
      relations: ['student', 'student.person', 'subject', 'group'],
    });
    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }
    return enrollment;
  }

  async update(id: number, updateEnrollmentDto: UpdateEnrollmentDto): Promise<Inscripcion> {
    const enrollment = await this.findOne(id);
    Object.assign(enrollment, updateEnrollmentDto);
    return this.enrollmentRepository.save(enrollment);
  }

  async remove(id: number): Promise<void> {
    const enrollment = await this.findOne(id);
    await this.enrollmentRepository.remove(enrollment);
  }

  async findByStudent(studentId: number, gestion?: string): Promise<Inscripcion[]> {
    const query = this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.subject', 'subject')
      .leftJoinAndSelect('enrollment.group', 'group')
      .where('enrollment.student_id = :studentId', { studentId });

    if (gestion) {
      query.andWhere('enrollment.gestion = :gestion', { gestion });
    }

    return query.orderBy('enrollment.semester', 'ASC').getMany();
  }

  async findBySubject(subjectId: number, gestion: string): Promise<Inscripcion[]> {
    return this.enrollmentRepository.find({
      where: { subject_id: subjectId, gestion },
      relations: ['student', 'student.person', 'group'],
      order: { created_at: 'ASC' },
    });
  }

  async findByGroup(groupId: number, gestion: string): Promise<Inscripcion[]> {
    return this.enrollmentRepository.find({
      where: { group_id: groupId, gestion },
      relations: ['student', 'student.person', 'subject'],
      order: { created_at: 'ASC' },
    });
  }

  async updateStatus(id: number, status: EnrollmentStatus, finalGrade?: number): Promise<Inscripcion> {
    const enrollment = await this.findOne(id);
    enrollment.status = status;
    if (finalGrade !== undefined) {
      enrollment.final_grade = finalGrade;
    }
    return this.enrollmentRepository.save(enrollment);
  }

  async getStudentAcademicRecord(studentId: number): Promise<{
    enrollments: Inscripcion[];
    stats: { approved: number; failed: number; inProgress: number; average: number };
  }> {
    const enrollments = await this.enrollmentRepository.find({
      where: { student_id: studentId },
      relations: ['subject', 'group'],
      order: { gestion: 'ASC', semester: 'ASC' },
    });

    const stats = {
      approved: 0,
      failed: 0,
      inProgress: 0,
      average: 0,
    };

    let totalGrade = 0;
    let countWithGrade = 0;

    enrollments.forEach((e) => {
      if (e.status === EnrollmentStatus.APROBADO) {
        stats.approved++;
        if (e.final_grade) {
          totalGrade += e.final_grade;
          countWithGrade++;
        }
      } else if (e.status === EnrollmentStatus.REPROBADO) {
        stats.failed++;
      } else if (e.status === EnrollmentStatus.CURSANDO) {
        stats.inProgress++;
      }
    });

    if (countWithGrade > 0) {
      stats.average = Math.round(totalGrade / countWithGrade * 100) / 100;
    }

    return { enrollments, stats };
  }

  async bulkCreate(createEnrollmentDtos: CreateEnrollmentDto[]): Promise<Inscripcion[]> {
    const enrollments = createEnrollmentDtos.map((dto) =>
      this.enrollmentRepository.create(dto),
    );
    return this.enrollmentRepository.save(enrollments);
  }
}