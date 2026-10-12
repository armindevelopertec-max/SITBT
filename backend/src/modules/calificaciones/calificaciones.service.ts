import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Calificacion,
  EstadoCalificacionRegular,
  EstadoCalificacion2T,
  EstadoCalificacionDefinitivo,
} from '../../entities/calificacion.entity';
import { AuditoriaCalificacion } from '../../entities/auditoria-calificacion.entity';
import { Inscripcion } from '../../entities/inscripcion.entity';
import { CrearCalificacionDto } from './dto/crear-calificacion.dto';
import { ActualizarCalificacionDto } from './dto/actualizar-calificacion.dto';

@Injectable()
export class ServicioCalificaciones {
  constructor(
    @InjectRepository(Calificacion)
    private calificacionRepository: Repository<Calificacion>,
    @InjectRepository(AuditoriaCalificacion)
    private gradeAuditRepository: Repository<AuditoriaCalificacion>,
    @InjectRepository(Inscripcion)
    private enrollmentRepository: Repository<Inscripcion>,
  ) {}

  async create(crearCalificacionDto: CrearCalificacionDto): Promise<Calificacion> {
    const existing = await this.calificacionRepository.findOne({
      where: { enrollment_id: crearCalificacionDto.enrollment_id },
    });

    if (existing) {
      throw new BadRequestException('Grade already exists for this enrollment');
    }

    const grade = this.calificacionRepository.create(crearCalificacionDto);
    return this.calificacionRepository.save(grade);
  }

  async findAll(
    page = 1,
    limit = 20,
    gestion?: string,
    statusDefinitivo?: EstadoCalificacionDefinitivo,
  ): Promise<{ data: Calificacion[]; total: number; page: number; limit: number }> {
    const query = this.calificacionRepository
      .createQueryBuilder('grade')
      .leftJoinAndSelect('grade.enrollment', 'enrollment')
      .leftJoinAndSelect('enrollment.student', 'student')
      .leftJoinAndSelect('enrollment.person', 'person')
      .leftJoinAndSelect('enrollment.subject', 'subject')
      .leftJoinAndSelect('enrollment.group', 'group');

    if (gestion) {
      query.andWhere('enrollment.gestion = :gestion', { gestion });
    }

    if (statusDefinitivo) {
      query.andWhere('grade.status_definitivo = :statusDefinitivo', { statusDefinitivo });
    }

    const [data, total] = await query
      .orderBy('grade.registered_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Calificacion> {
    const grade = await this.calificacionRepository.findOne({
      where: { id },
      relations: ['enrollment', 'enrollment.student', 'enrollment.person', 'enrollment.subject', 'teacher'],
    });
    if (!grade) {
      throw new NotFoundException(`Calificación con ID ${id} no encontrada`);
    }
    return grade;
  }

  async findByEnrollment(enrollmentId: number): Promise<Calificacion> {
    const grade = await this.calificacionRepository.findOne({
      where: { enrollment_id: enrollmentId },
      relations: ['enrollment', 'enrollment.student', 'enrollment.person', 'enrollment.subject'],
    });
    if (!grade) {
      throw new NotFoundException(`Grade for enrollment ${enrollmentId} no encontrada`);
    }
    return grade;
  }

  async update(
    id: number,
    actualizarCalificacionDto: ActualizarCalificacionDto,
    registeredBy: number,
  ): Promise<Calificacion> {
    const grade = await this.findOne(id);
    const oldValue = JSON.stringify(grade);

    Object.assign(grade, actualizarCalificacionDto);
    const savedGrade = await this.calificacionRepository.save(grade);

    await this.gradeAuditRepository.save({
      grade_id: id,
      field_changed: 'multiple',
      old_value: oldValue,
      new_value: JSON.stringify(actualizarCalificacionDto),
      changed_by: registeredBy,
    });

    return savedGrade;
  }

  async remove(id: number): Promise<void> {
    const grade = await this.findOne(id);
    await this.calificacionRepository.remove(grade);
  }

  async updatePartialGrades(
    id: number,
    partial1?: number,
    partial2?: number,
    registeredBy?: number,
  ): Promise<Calificacion> {
    const grade = await this.findOne(id);

    if (partial1 !== undefined) grade.partial_1 = partial1;
    if (partial2 !== undefined) grade.partial_2 = partial2;

    if (grade.partial_1 !== null && grade.partial_2 !== null) {
      grade.final_average = Math.round((grade.partial_1 + grade.partial_2) / 2);
      grade.status_regular = grade.final_average >= 51 ? EstadoCalificacionRegular.APROBADO : EstadoCalificacionRegular.REPROBADO;
    }

    const savedGrade = await this.calificacionRepository.save(grade);

    if (registeredBy) {
      await this.gradeAuditRepository.save({
        grade_id: id,
        field_changed: 'partials',
        old_value: JSON.stringify({ partial1: grade.partial_1, partial2: grade.partial_2 }),
        new_value: JSON.stringify({ partial1, partial2 }),
        changed_by: registeredBy,
      });
    }

    return savedGrade;
  }

  async applySecondTurn(id: number, score: number, registeredBy?: number): Promise<Calificacion> {
    const grade = await this.findOne(id);

    if (!grade.second_turn_eligible) {
      throw new BadRequestException('Student is not eligible for second turn');
    }

    grade.second_turn_score = score;
    grade.second_turn_applied = true;
    grade.status_2t = score >= 51 ? EstadoCalificacion2T.APROBADO : EstadoCalificacion2T.REPROBADO;

    if (grade.status_regular === EstadoCalificacionRegular.REPROBADO && grade.status_2t === EstadoCalificacion2T.APROBADO) {
      grade.definitive_grade = score;
      grade.status_definitivo = EstadoCalificacionDefinitivo.APROBADO;
    } else if (grade.status_2t === EstadoCalificacion2T.REPROBADO) {
      grade.definitive_grade = grade.status_regular === EstadoCalificacionRegular.APROBADO ? grade.final_average : score;
      grade.status_definitivo = EstadoCalificacionDefinitivo.REPROBADO;
    } else {
      grade.definitive_grade = score;
      grade.status_definitivo = EstadoCalificacionDefinitivo.APROBADO;
    }

    const savedGrade = await this.calificacionRepository.save(grade);

    if (registeredBy) {
      await this.gradeAuditRepository.save({
        grade_id: id,
        field_changed: 'second_turn',
        old_value: JSON.stringify({ second_turn_applied: false }),
        new_value: JSON.stringify({ second_turn_score: score, second_turn_applied: true }),
        changed_by: registeredBy,
      });
    }

    return savedGrade;
  }

  async getGradeHistory(enrollmentId: number): Promise<AuditoriaCalificacion[]> {
    return this.gradeAuditRepository.find({
      where: { grade_id: enrollmentId },
      relations: ['user'],
      order: { changed_at: 'DESC' },
    });
  }

  async getGradesByStudent(studentId: number, gestion?: string): Promise<Calificacion[]> {
    const query = this.calificacionRepository
      .createQueryBuilder('grade')
      .leftJoinAndSelect('grade.enrollment', 'enrollment')
      .leftJoinAndSelect('enrollment.subject', 'subject')
      .leftJoinAndSelect('enrollment.group', 'group')
      .where('enrollment.student_id = :studentId', { studentId });

    if (gestion) {
      query.andWhere('enrollment.gestion = :gestion', { gestion });
    }

    return query.orderBy('enrollment.gestion', 'ASC').getMany();
  }

  async getGradesByGroup(groupId: number, gestion: string): Promise<Calificacion[]> {
    return this.calificacionRepository
      .createQueryBuilder('grade')
      .leftJoinAndSelect('grade.enrollment', 'enrollment')
      .leftJoinAndSelect('enrollment.student', 'student')
      .leftJoinAndSelect('enrollment.person', 'person')
      .leftJoinAndSelect('enrollment.subject', 'subject')
      .where('enrollment.group_id = :groupId', { groupId })
      .andWhere('enrollment.gestion = :gestion', { gestion })
      .orderBy('student.person.lastname_paternal', 'ASC')
      .getMany();
  }
}