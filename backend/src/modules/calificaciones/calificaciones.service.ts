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
      where: { inscripcionId: crearCalificacionDto.inscripcionId },
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
      .leftJoinAndSelect('grade.inscripcion', 'enrollment')
      .leftJoinAndSelect('enrollment.estudiante', 'student')
      .leftJoinAndSelect('student.persona', 'person')
      .leftJoinAndSelect('enrollment.materia', 'subject')
      .leftJoinAndSelect('enrollment.grupo', 'group');

    if (gestion) {
      query.andWhere('enrollment.gestion = :gestion', { gestion });
    }

    if (statusDefinitivo) {
      query.andWhere('grade.estadoDefinitivo = :statusDefinitivo', { statusDefinitivo });
    }

    const [data, total] = await query
      .orderBy('grade.registradoEn', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Calificacion> {
    const grade = await this.calificacionRepository.findOne({
      where: { id },
      relations: ['inscripcion', 'inscripcion.estudiante', 'inscripcion.estudiante.persona', 'inscripcion.materia', 'docente'],
    });
    if (!grade) {
      throw new NotFoundException(`Calificación con ID ${id} no encontrada`);
    }
    return grade;
  }

  async findByEnrollment(enrollmentId: number): Promise<Calificacion> {
    const grade = await this.calificacionRepository.findOne({
      where: { inscripcionId: enrollmentId },
      relations: ['inscripcion', 'inscripcion.estudiante', 'inscripcion.estudiante.persona', 'inscripcion.materia'],
    });
    if (!grade) {
      throw new NotFoundException(`Calificación de la inscripción ${enrollmentId} no encontrada`);
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
      calificacionId: id,
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

    if (partial1 !== undefined) grade.parcial1 = partial1;
    if (partial2 !== undefined) grade.parcial2 = partial2;

    if (grade.parcial1 !== null && grade.parcial2 !== null) {
      grade.promedioFinal = Math.round((grade.parcial1 + grade.parcial2) / 2);
      grade.estadoRegular = grade.promedioFinal >= 51 ? EstadoCalificacionRegular.APROBADO : EstadoCalificacionRegular.REPROBADO;
    }

    const savedGrade = await this.calificacionRepository.save(grade);

    if (registeredBy) {
      await this.gradeAuditRepository.save({
        calificacionId: id,
        field_changed: 'partials',
        old_value: JSON.stringify({ partial1: grade.parcial1, partial2: grade.parcial2 }),
        new_value: JSON.stringify({ partial1, partial2 }),
        changed_by: registeredBy,
      });
    }

    return savedGrade;
  }

  async applySecondTurn(id: number, score: number, registeredBy?: number): Promise<Calificacion> {
    const grade = await this.findOne(id);

    if (!grade.aptoSegundaTurno) {
      throw new BadRequestException('Student is not eligible for second turn');
    }

    grade.notaSegundaTurno = score;
    grade.segundaTurnoAplicado = true;
    grade.estado2T = score >= 51 ? EstadoCalificacion2T.APROBADO : EstadoCalificacion2T.REPROBADO;

    if (grade.estadoRegular === EstadoCalificacionRegular.REPROBADO && grade.estado2T === EstadoCalificacion2T.APROBADO) {
      grade.notaDefinitiva = score;
      grade.estadoDefinitivo = EstadoCalificacionDefinitivo.APROBADO;
    } else if (grade.estado2T === EstadoCalificacion2T.REPROBADO) {
      grade.notaDefinitiva = grade.estadoRegular === EstadoCalificacionRegular.APROBADO ? grade.promedioFinal : score;
      grade.estadoDefinitivo = EstadoCalificacionDefinitivo.REPROBADO;
    } else {
      grade.notaDefinitiva = score;
      grade.estadoDefinitivo = EstadoCalificacionDefinitivo.APROBADO;
    }

    const savedGrade = await this.calificacionRepository.save(grade);

    if (registeredBy) {
      await this.gradeAuditRepository.save({
        calificacionId: id,
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
      where: { calificacionId: enrollmentId },
      relations: ['usuario'],
      order: { cambiadoEn: 'DESC' },
    });
  }

  async getGradesByStudent(studentId: number, gestion?: string): Promise<Calificacion[]> {
    const query = this.calificacionRepository
      .createQueryBuilder('grade')
      .leftJoinAndSelect('grade.inscripcion', 'enrollment')
      .leftJoinAndSelect('enrollment.materia', 'subject')
      .leftJoinAndSelect('enrollment.grupo', 'group')
      .where('enrollment.estudianteId = :studentId', { studentId });

    if (gestion) {
      query.andWhere('enrollment.gestion = :gestion', { gestion });
    }

    return query.orderBy('enrollment.gestion', 'ASC').getMany();
  }

  async getGradesByGroup(groupId: number, gestion: string): Promise<Calificacion[]> {
    return this.calificacionRepository
      .createQueryBuilder('grade')
      .leftJoinAndSelect('grade.inscripcion', 'enrollment')
      .leftJoinAndSelect('enrollment.estudiante', 'student')
      .leftJoinAndSelect('student.persona', 'person')
      .leftJoinAndSelect('enrollment.materia', 'subject')
      .where('enrollment.grupoId = :groupId', { groupId })
      .andWhere('enrollment.gestion = :gestion', { gestion })
      .orderBy('student.persona.apellidoPaterno', 'ASC')
      .getMany();
  }
}