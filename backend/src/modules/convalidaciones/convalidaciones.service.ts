import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConvalidacionEstudiante, EstadoConvalidacion, TipoConvalidacion } from '../../entities/convalidacion-estudiante.entity';
import { CrearConvalidacionDto } from './dto/crear-convalidacion.dto';
import { ActualizarConvalidacionDto } from './dto/actualizar-convalidacion.dto';

@Injectable()
export class ServicioConvalidaciones {
  constructor(
    @InjectRepository(ConvalidacionEstudiante)
    private convalidacionRepository: Repository<ConvalidacionEstudiante>,
  ) {}

  async create(createDto: CrearConvalidacionDto): Promise<ConvalidacionEstudiante> {
    const convalidation = this.convalidacionRepository.create(createDto);
    return this.convalidacionRepository.save(convalidation);
  }

  async findAll(
    page = 1,
    limit = 20,
    status?: EstadoConvalidacion,
    type?: TipoConvalidacion,
    studentId?: number,
  ): Promise<{ data: ConvalidacionEstudiante[]; total: number; page: number; limit: number }> {
    const query = this.convalidacionRepository
      .createQueryBuilder('convalidation')
      .leftJoinAndSelect('convalidation.student', 'student')
      .leftJoinAndSelect('student.person', 'person')
      .leftJoinAndSelect('convalidation.target_subject', 'subject')
      .leftJoinAndSelect('convalidation.equivalence', 'equivalence')
      .leftJoinAndSelect('convalidation.approver', 'approver');

    if (status) {
      query.andWhere('convalidation.estado = :status', { estado: status });
    }

    if (type) {
      query.andWhere('convalidation.tipo = :type', { tipo: type });
    }

    if (studentId) {
      query.andWhere('convalidation.estudianteId = :studentId', { studentId });
    }

    const [data, total] = await query
      .orderBy('convalidation.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<ConvalidacionEstudiante> {
    const convalidation = await this.convalidacionRepository.findOne({
      where: { id },
      relations: ['student', 'student.person', 'target_subject', 'equivalence', 'approver'],
    });
    if (!convalidation) {
      throw new NotFoundException(`Convalidación con ID ${id} no encontrada`);
    }
    return convalidation;
  }

  async update(id: number, updateDto: ActualizarConvalidacionDto): Promise<ConvalidacionEstudiante> {
    const convalidation = await this.findOne(id);
    Object.assign(convalidation, updateDto);
    return this.convalidacionRepository.save(convalidation);
  }

  async remove(id: number): Promise<void> {
    const convalidation = await this.findOne(id);
    await this.convalidacionRepository.remove(convalidation);
  }

  async findByStudent(studentId: number): Promise<ConvalidacionEstudiante[]> {
    return this.convalidacionRepository.find({
      where: { estudianteId: studentId },
      relations: ['target_subject', 'equivalence', 'approver'],
      order: { creadoEn: 'DESC' },
    });
  }

  async approve(id: number, approvedBy: number, resolutionNumber?: string, resolutionDate?: Date): Promise<ConvalidacionEstudiante> {
    const convalidation = await this.findOne(id);
    convalidation.estado = EstadoConvalidacion.APROBADA;
    convalidation.aprobadoPor = approvedBy;
    if (resolutionNumber) convalidation.numeroResolucion = resolutionNumber;
    if (resolutionDate) convalidation.fechaResolucion = resolutionDate;
    return this.convalidacionRepository.save(convalidation);
  }

  async reject(id: number): Promise<ConvalidacionEstudiante> {
    const convalidation = await this.findOne(id);
    convalidation.estado = EstadoConvalidacion.RECHAZADA;
    return this.convalidacionRepository.save(convalidation);
  }

  async getPending(): Promise<ConvalidacionEstudiante[]> {
    return this.convalidacionRepository.find({
      where: { estado: EstadoConvalidacion.PENDIENTE },
      relations: ['student', 'student.person', 'target_subject'],
      order: { creadoEn: 'ASC' },
    });
  }
}