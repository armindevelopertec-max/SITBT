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
  ): Promise<{ data: RegistroAuditoria[]; total: number; page: number; limit: number }> {
    const query = this.auditoriaRepository
      .createQueryBuilder('audit')
      .leftJoinAndSelect('audit.user', 'user');

    if (userId) {
      query.andWhere('audit.user_id = :userId', { userId });
    }

    if (action) {
      query.andWhere('audit.action = :action', { action });
    }

    if (table) {
      query.andWhere('audit.table = :table', { table });
    }

    if (startDate && endDate) {
      query.andWhere('audit.date BETWEEN :startDate AND :endDate', { startDate, endDate });
    }

    const [data, total] = await query
      .orderBy('audit.date', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findByUser(userId: number, limit = 50): Promise<RegistroAuditoria[]> {
    return this.auditoriaRepository.find({
      where: { user_id: userId },
      order: { date: 'DESC' },
      take: limit,
    });
  }

  async findByTable(tableName: string, limit = 50): Promise<RegistroAuditoria[]> {
    return this.auditoriaRepository.find({
      where: { table: tableName },
      order: { date: 'DESC' },
      take: limit,
    });
  }

  async findByRecord(tableName: string, recordId: number): Promise<RegistroAuditoria[]> {
    return this.auditoriaRepository.find({
      where: { table: tableName, record_id: recordId },
      order: { date: 'DESC' },
    });
  }

  async getRecentActions(limit = 20): Promise<RegistroAuditoria[]> {
    return this.auditoriaRepository.find({
      relations: ['user'],
      order: { date: 'DESC' },
      take: limit,
    });
  }

  async getActionStats(startDate?: Date, endDate?: Date): Promise<{ action: string; count: number }[]> {
    const query = this.auditoriaRepository
      .createQueryBuilder('audit')
      .select('audit.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit.action');

    if (startDate && endDate) {
      query.where('audit.date BETWEEN :startDate AND :endDate', { startDate, endDate });
    }

    return query.getRawMany();
  }
}