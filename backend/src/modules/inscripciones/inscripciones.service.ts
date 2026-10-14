import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inscripcion, EstadoInscripcion } from '../../entities/inscripcion.entity';
import { CrearInscripcionDto } from './dto/crear-inscripcion.dto';
import { ActualizarInscripcionDto } from './dto/actualizar-inscripcion.dto';

@Injectable()
export class ServicioInscripciones {
  constructor(
    @InjectRepository(Inscripcion)
    private inscripcionRepository: Repository<Inscripcion>,
  ) {}

  async create(crearInscripcionDto: CrearInscripcionDto): Promise<Inscripcion> {
    const existing = await this.inscripcionRepository.findOne({
      where: {
        estudianteId: crearInscripcionDto.estudianteId,
        materiaId: crearInscripcionDto.materiaId,
        gestion: crearInscripcionDto.gestion,
      },
    });

    if (existing) {
      throw new BadRequestException('El estudiante ya está inscrito en esta materia para esta gestión');
    }

    const enrollment = this.inscripcionRepository.create(crearInscripcionDto);
    return this.inscripcionRepository.save(enrollment);
  }

  async findAll(
    page = 1,
    limit = 20,
    gestion?: string,
    status?: EstadoInscripcion,
    studentId?: number,
  ): Promise<{ data: Inscripcion[]; total: number; page: number; limit: number }> {
    const query = this.inscripcionRepository
      .createQueryBuilder('inscripcion')
      .leftJoinAndSelect('inscripcion.estudiante', 'student')
      .leftJoinAndSelect('student.persona', 'person')
      .leftJoinAndSelect('inscripcion.materia', 'materia')
      .leftJoinAndSelect('inscripcion.grupo', 'grupo');

    if (gestion) {
      query.andWhere('inscripcion.gestion = :gestion', { gestion });
    }

    if (status) {
      query.andWhere('inscripcion.estado = :estado', { estado: status });
    }

    if (studentId) {
      query.andWhere('inscripcion.estudianteId = :studentId', { studentId });
    }

    const [data, total] = await query
      .orderBy('inscripcion.creadoEn', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Inscripcion> {
    const enrollment = await this.inscripcionRepository.findOne({
      where: { id },
      relations: ['estudiante', 'estudiante.persona', 'materia', 'grupo'],
    });
    if (!enrollment) {
      throw new NotFoundException(`Inscripción con ID ${id} no encontrada`);
    }
    return enrollment;
  }

  async update(id: number, actualizarInscripcionDto: ActualizarInscripcionDto): Promise<Inscripcion> {
    const enrollment = await this.findOne(id);
    Object.assign(enrollment, actualizarInscripcionDto);
    return this.inscripcionRepository.save(enrollment);
  }

  async remove(id: number): Promise<void> {
    const enrollment = await this.findOne(id);
    await this.inscripcionRepository.remove(enrollment);
  }

  async findByStudent(studentId: number, gestion?: string): Promise<Inscripcion[]> {
    const query = this.inscripcionRepository
      .createQueryBuilder('inscripcion')
      .leftJoinAndSelect('inscripcion.materia', 'materia')
      .leftJoinAndSelect('inscripcion.grupo', 'grupo')
      .where('inscripcion.estudianteId = :studentId', { studentId });

    if (gestion) {
      query.andWhere('inscripcion.gestion = :gestion', { gestion });
    }

    return query.orderBy('inscripcion.semestre', 'ASC').getMany();
  }

  async findBySubject(subjectId: number, gestion: string): Promise<Inscripcion[]> {
    return this.inscripcionRepository.find({
      where: { materiaId: subjectId, gestion },
      relations: ['estudiante', 'estudiante.persona', 'grupo'],
      order: { creadoEn: 'ASC' },
    });
  }

  async findByGroup(groupId: number, gestion: string): Promise<Inscripcion[]> {
    return this.inscripcionRepository.find({
      where: { grupoId: groupId, gestion },
      relations: ['estudiante', 'estudiante.persona', 'materia'],
      order: { creadoEn: 'ASC' },
    });
  }

  async updateStatus(id: number, estado: EstadoInscripcion, finalGrade?: number): Promise<Inscripcion> {
    const inscripcion = await this.findOne(id);
    inscripcion.estado = estado;
    if (finalGrade !== undefined) {
      inscripcion.notaFinal = finalGrade;
    }
    return this.inscripcionRepository.save(inscripcion);
  }

  async getStudentAcademicRecord(studentId: number): Promise<{
    enrollments: Inscripcion[];
    stats: { aprobadas: number; reprobadas: number; enCurso: number; promedio: number };
  }> {
    const enrollments = await this.inscripcionRepository.find({
      where: { estudianteId: studentId },
      relations: ['materia', 'grupo'],
      order: { gestion: 'ASC', semestre: 'ASC' },
    });

    const stats = {
      aprobadas: 0,
      reprobadas: 0,
      enCurso: 0,
      promedio: 0,
    };

    let totalGrade = 0;
    let countWithGrade = 0;

    enrollments.forEach((e) => {
      if (e.estado === EstadoInscripcion.APROBADO) {
        stats.aprobadas++;
        if (e.notaFinal) {
          totalGrade += e.notaFinal;
          countWithGrade++;
        }
      } else if (e.estado === EstadoInscripcion.REPROBADO) {
        stats.reprobadas++;
      } else if (e.estado === EstadoInscripcion.CURSANDO) {
        stats.enCurso++;
      }
    });

    if (countWithGrade > 0) {
      stats.promedio = Math.round(totalGrade / countWithGrade * 100) / 100;
    }

    return { enrollments, stats };
  }

  async bulkCreate(crearInscripcionDtos: CrearInscripcionDto[]): Promise<Inscripcion[]> {
    const enrollments = crearInscripcionDtos.map((dto) =>
      this.inscripcionRepository.create(dto),
    );
    return this.inscripcionRepository.save(enrollments);
  }
}