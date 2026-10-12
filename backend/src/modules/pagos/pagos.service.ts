import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pago, EstadoPago, MetodoPago } from '../../entities/pago.entity';
import { CrearPagoDto } from './dto/crear-pago.dto';
import { ActualizarPagoDto } from './dto/actualizar-pago.dto';

@Injectable()
export class ServicioPagos {
  constructor(
    @InjectRepository(Pago)
    private pagoRepository: Repository<Pago>,
  ) {}

  async create(createDto: CrearPagoDto): Promise<Pago> {
    const payment = this.pagoRepository.create({
      ...createDto,
      payment_date: new Date(createDto.payment_date),
    } as Partial<Pago>);
    return this.pagoRepository.save(payment);
  }

  async findAll(
    page = 1,
    limit = 20,
    gestion?: string,
    status?: EstadoPago,
    studentId?: number,
    conceptId?: number,
  ): Promise<{ data: Pago[]; total: number; page: number; limit: number }> {
    const query = this.pagoRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.student', 'student')
      .leftJoinAndSelect('student.person', 'person')
      .leftJoinAndSelect('payment.concept', 'concept')
      .leftJoinAndSelect('payment.receiver', 'receiver');

    if (gestion) {
      query.andWhere('payment.gestion = :gestion', { gestion });
    }

    if (status) {
      query.andWhere('payment.status = :status', { status });
    }

    if (studentId) {
      query.andWhere('payment.student_id = :studentId', { studentId });
    }

    if (conceptId) {
      query.andWhere('payment.concept_id = :conceptId', { conceptId });
    }

    const [data, total] = await query
      .orderBy('payment.payment_date', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Pago> {
    const payment = await this.pagoRepository.findOne({
      where: { id },
      relations: ['student', 'student.person', 'concept', 'receiver'],
    });
    if (!payment) {
      throw new NotFoundException(`Pago con ID ${id} no encontrado`);
    }
    return payment;
  }

  async update(id: number, updateDto: ActualizarPagoDto): Promise<Pago> {
    const payment = await this.findOne(id);
    Object.assign(payment, updateDto);
    return this.pagoRepository.save(payment);
  }

  async remove(id: number): Promise<void> {
    const payment = await this.findOne(id);
    await this.pagoRepository.remove(payment);
  }

  async findByStudent(studentId: number, gestion?: string): Promise<Pago[]> {
    const query = this.pagoRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.concept', 'concept')
      .leftJoinAndSelect('payment.receiver', 'receiver')
      .where('payment.student_id = :studentId', { studentId });

    if (gestion) {
      query.andWhere('payment.gestion = :gestion', { gestion });
    }

    return query.orderBy('payment.payment_date', 'DESC').getMany();
  }

  async getStudentDebt(studentId: number, gestion: string): Promise<{ totalPaid: number; pending: number }> {
    const payments = await this.pagoRepository.find({
      where: { student_id: studentId, gestion, status: EstadoPago.PAGADO },
    });

    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    return { totalPaid, pending: 0 };
  }

  async getPaymentsByDateRange(
    startDate: Date,
    endDate: Date,
    gestion?: string,
  ): Promise<Pago[]> {
    const query = this.pagoRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.student', 'student')
      .leftJoinAndSelect('student.person', 'person')
      .leftJoinAndSelect('payment.concept', 'concept')
      .where('payment.payment_date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('payment.status = :status', { status: EstadoPago.PAGADO });

    if (gestion) {
      query.andWhere('payment.gestion = :gestion', { gestion });
    }

    return query.orderBy('payment.payment_date', 'DESC').getMany();
  }

  async getDailyCollection(fecha: string, gestion: string): Promise<{ total: number; count: number }> {
    const startDate = new Date(fecha);
    const endDate = new Date(fecha);
    endDate.setHours(23, 59, 59);

    const payments = await this.pagoRepository
      .createQueryBuilder('payment')
      .where('payment.payment_date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('payment.gestion = :gestion', { gestion })
      .andWhere('payment.status = :status', { status: EstadoPago.PAGADO })
      .getMany();

    const total = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    return { total, count: payments.length };
  }

  async annul(id: number): Promise<Pago> {
    const payment = await this.findOne(id);
    payment.status = EstadoPago.ANULADO;
    return this.pagoRepository.save(payment);
  }

  async getCollectionSummary(gestion: string): Promise<{
    total: number;
    byMethod: { method: MetodoPago; total: number }[];
    byConcept: { concept: string; total: number }[];
  }> {
    const payments = await this.pagoRepository.find({
      where: { gestion, status: EstadoPago.PAGADO },
      relations: ['concept'],
    });

    const total = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    const byMethodMap = new Map<MetodoPago, number>();
    const byConceptMap = new Map<string, number>();

    payments.forEach((p) => {
      byMethodMap.set(p.payment_method, (byMethodMap.get(p.payment_method) || 0) + Number(p.amount));
      byConceptMap.set(p.concepto?.name || 'Unknown', (byConceptMap.get(p.concepto?.name || 'Unknown') || 0) + Number(p.amount));
    });

    return {
      total,
      byMethod: Array.from(byMethodMap.entries()).map(([method, total]) => ({ method, total })),
      byConcept: Array.from(byConceptMap.entries()).map(([concept, total]) => ({ concept, total })),
    };
  }
}