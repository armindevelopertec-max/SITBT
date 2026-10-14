import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegistroAuditoria } from '../../entities/registro-auditoria.entity';

@Injectable()
export class ServicioAuditoria {
  constructor(
    @InjectRepository(RegistroAuditoria)
    private auditoriaRepository: Repository<RegistroAuditoria>,
  ) {}

  async create(log: Partial<RegistroAuditoria>): Promise<RegistroAuditoria> {
    const auditLog = this.auditoriaRepository.create(log);
    return this.auditoriaRepository.save(auditLog);
  }

  async findAll(
    page = 1,
    limit = 50,
    userId?: number,
    action?: string,
    table?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{ datos: RegistroAuditoria[]; total: number; pagina: number; limite: number }> {
    const query = this.auditoriaRepository
      .createQueryBuilder('audit')
      .leftJoinAndSelect('audit.usuario', 'user');

    if (userId) {
      query.andWhere('audit.usuarioId = :userId', { userId });
    }

    if (action) {
      query.andWhere('audit.accion = :action', { action });
    }

    if (table) {
      query.andWhere('audit.tabla = :table', { table });
    }

    if (startDate && endDate) {
      query.andWhere('audit.fecha BETWEEN :startDate AND :endDate', { startDate, endDate });
    }

    const [data, total] = await query
      .orderBy('audit.fecha', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { datos: data, total, pagina: page, limite: limit };
  }

  async findByUser(userId: number, limit = 50): Promise<RegistroAuditoria[]> {
    return this.auditoriaRepository.find({
      where: { usuarioId: userId },
      order: { fecha: 'DESC' },
      take: limit,
    });
  }

  async findByTable(tableName: string, limit = 50): Promise<RegistroAuditoria[]> {
    return this.auditoriaRepository.find({
      where: { tabla: tableName },
      order: { fecha: 'DESC' },
      take: limit,
    });
  }

  async findByRecord(tableName: string, recordId: number): Promise<RegistroAuditoria[]> {
    return this.auditoriaRepository.find({
      where: { tabla: tableName, registroId: recordId },
      order: { fecha: 'DESC' },
    });
  }

  async getRecentActions(limit = 20): Promise<RegistroAuditoria[]> {
    return this.auditoriaRepository.find({
      relations: ['usuario'],
      order: { fecha: 'DESC' },
      take: limit,
    });
  }

  async getActionStats(startDate?: Date, endDate?: Date): Promise<{ action: string; count: number }[]> {
    const query = this.auditoriaRepository
      .createQueryBuilder('audit')
      .select('audit.accion', 'action')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit.accion');

    if (startDate && endDate) {
      query.where('audit.fecha BETWEEN :startDate AND :endDate', { startDate, endDate });
    }

    return query.getRawMany();
  }
}