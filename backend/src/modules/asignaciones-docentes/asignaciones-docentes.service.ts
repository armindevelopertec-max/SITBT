import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AsignacionDocente, EstadoAsignacionDocente } from '../../entities/asignacion-docente.entity';
import { CrearAsignacionDocenteDto } from './dto/crear-asignacion-docente.dto';
import { ActualizarAsignacionDocenteDto } from './dto/actualizar-asignacion-docente.dto';

@Injectable()
export class ServicioAsignacionesDocentes {
  constructor(
    @InjectRepository(AsignacionDocente)
    private assignmentRepository: Repository<AsignacionDocente>,
  ) {}

  async create(createDto: CrearAsignacionDocenteDto): Promise<AsignacionDocente> {
    const assignment = this.assignmentRepository.create(createDto);
    return this.assignmentRepository.save(assignment);
  }

  async findAll(
    page = 1,
    limit = 20,
    gestion?: string,
    status?: EstadoAsignacionDocente,
  ): Promise<{ data: AsignacionDocente[]; total: number; page: number; limit: number }> {
    const query = this.assignmentRepository
      .createQueryBuilder('assignment')
      .leftJoinAndSelect('assignment.teacher', 'teacher')
      .leftJoinAndSelect('teacher.person', 'person')
      .leftJoinAndSelect('assignment.subject', 'subject')
      .leftJoinAndSelect('assignment.group', 'group');

    if (gestion) {
      query.andWhere('assignment.gestion = :gestion', { gestion });
    }

    if (status) {
      query.andWhere('assignment.status = :status', { status });
    }

    const [data, total] = await query
      .orderBy('assignment.gestion', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<AsignacionDocente> {
    const assignment = await this.assignmentRepository.findOne({
      where: { id },
      relations: ['teacher', 'teacher.person', 'subject', 'group'],
    });
    if (!assignment) {
      throw new NotFoundException(`Asignación docente con ID ${id} no encontrada`);
    }
    return assignment;
  }

  async update(id: number, updateDto: ActualizarAsignacionDocenteDto): Promise<AsignacionDocente> {
    const assignment = await this.findOne(id);
    Object.assign(assignment, updateDto);
    return this.assignmentRepository.save(assignment);
  }

  async remove(id: number): Promise<void> {
    const assignment = await this.findOne(id);
    await this.assignmentRepository.remove(assignment);
  }

  async findByTeacher(teacherId: number, gestion?: string): Promise<AsignacionDocente[]> {
    const query = this.assignmentRepository
      .createQueryBuilder('assignment')
      .leftJoinAndSelect('assignment.subject', 'subject')
      .leftJoinAndSelect('assignment.group', 'group')
      .where('assignment.teacher_id = :teacherId', { teacherId });

    if (gestion) {
      query.andWhere('assignment.gestion = :gestion', { gestion });
    }

    return query.orderBy('assignment.gestion', 'DESC').getMany();
  }

  async findByGroup(groupId: number, gestion: string): Promise<AsignacionDocente[]> {
    return this.assignmentRepository.find({
      where: { group_id: groupId, gestion },
      relations: ['teacher', 'teacher.person', 'subject'],
    });
  }

  async findBySubject(subjectId: number, gestion: string): Promise<AsignacionDocente[]> {
    return this.assignmentRepository.find({
      where: { subject_id: subjectId, gestion },
      relations: ['teacher', 'teacher.person', 'group'],
    });
  }

  async findActive(gestion: string): Promise<AsignacionDocente[]> {
    return this.assignmentRepository.find({
      where: { gestion, status: EstadoAsignacionDocente.ACTIVO },
      relations: ['teacher', 'teacher.person', 'subject', 'group'],
      order: { created_at: 'DESC' },
    });
  }
}