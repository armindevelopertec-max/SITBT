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
      payment_date: new Date(createDto.fechaPago),
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
      query.andWhere('payment.estado = :status', { status });
    }

    if (studentId) {
      query.andWhere('payment.estudianteId = :studentId', { studentId });
    }

    if (conceptId) {
      query.andWhere('payment.conceptoId = :conceptId', { conceptId });
    }

    const [data, total] = await query
      .orderBy('payment.fechaPago', 'DESC')
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
      .where('payment.estudianteId = :studentId', { studentId });

    if (gestion) {
      query.andWhere('payment.gestion = :gestion', { gestion });
    }

    return query.orderBy('payment.fechaPago', 'DESC').getMany();
  }

  async getStudentDebt(studentId: number, gestion: string): Promise<{ totalPaid: number; pending: number }> {
    const payments = await this.pagoRepository.find({
      where: { estudianteId: studentId, gestion, estado: EstadoPago.PAGADO },
    });

    const totalPaid = payments.reduce((sum, p) => sum + Number(p.monto), 0);

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
      .where('payment.fechaPago BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('payment.estado = :status', { estado: EstadoPago.PAGADO });

    if (gestion) {
      query.andWhere('payment.gestion = :gestion', { gestion });
    }

    return query.orderBy('payment.fechaPago', 'DESC').getMany();
  }

  async getDailyCollection(fecha: string, gestion: string): Promise<{ total: number; count: number }> {
    const startDate = new Date(fecha);
    const endDate = new Date(fecha);
    endDate.setHours(23, 59, 59);

    const payments = await this.pagoRepository
      .createQueryBuilder('payment')
      .where('payment.fechaPago BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('payment.gestion = :gestion', { gestion })
      .andWhere('payment.estado = :status', { estado: EstadoPago.PAGADO })
      .getMany();

    const total = payments.reduce((sum, p) => sum + Number(p.monto), 0);

    return { total, count: payments.length };
  }

  async annul(id: number): Promise<Pago> {
    const payment = await this.findOne(id);
    payment.estado = EstadoPago.ANULADO;
    return this.pagoRepository.save(payment);
  }

  async getCollectionSummary(gestion: string): Promise<{
    total: number;
    byMethod: { method: MetodoPago; total: number }[];
    byConcept: { concept: string; total: number }[];
  }> {
    const payments = await this.pagoRepository.find({
      where: { gestion, estado: EstadoPago.PAGADO },
      relations: ['concept'],
    });

    const total = payments.reduce((sum, p) => sum + Number(p.monto), 0);

    const byMethodMap = new Map<MetodoPago, number>();
    const byConceptMap = new Map<string, number>();

    payments.forEach((p) => {
      byMethodMap.set(p.metodoPago, (byMethodMap.get(p.metodoPago) || 0) + Number(p.monto));
      byConceptMap.set(p.concepto?.nombre || 'Unknown', (byConceptMap.get(p.concepto?.nombre || 'Unknown') || 0) + Number(p.monto));
    });

    return {
      total,
      byMethod: Array.from(byMethodMap.entries()).map(([method, total]) => ({ method, total })),
      byConcept: Array.from(byConceptMap.entries()).map(([concept, total]) => ({ concept, total })),
    };
  }
}