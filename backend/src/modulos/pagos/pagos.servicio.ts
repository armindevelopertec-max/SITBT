import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pago, EstadoPago, MetodoPago } from '../../entidades/pago.entidad';
import { ConceptoPago, EstadoConceptoPago } from '../../entidades/concepto-pago.entidad';
import { CrearPagoDto } from './dto/crear-pago.dto';
import { ActualizarPagoDto } from './dto/actualizar-pago.dto';

@Injectable()
export class ServicioPagos {
  constructor(
    @InjectRepository(Pago)
    private repositorioPago: Repository<Pago>,
    @InjectRepository(ConceptoPago)
    private repositorioConcepto: Repository<ConceptoPago>,
  ) {}

  async listarConceptos(): Promise<ConceptoPago[]> {
    return this.repositorioConcepto.find({
      where: { estado: EstadoConceptoPago.ACTIVO },
      order: { nombre: 'ASC' },
    });
  }

  async crear(crearPagoDto: CrearPagoDto): Promise<Pago> {
    const pago = this.repositorioPago.create({
      ...crearPagoDto,
      fechaPago: new Date(crearPagoDto.fechaPago),
    } as any);
    return this.repositorioPago.save(pago as any);
  }

  async obtenerTodos(
    pagina = 1,
    limite = 20,
    gestion?: string,
    estado?: EstadoPago,
    estudianteId?: number,
    conceptoId?: number,
  ): Promise<{ datos: Pago[]; total: number; pagina: number; limite: number }> {
    const consulta = this.repositorioPago
      .createQueryBuilder('pago')
      .leftJoinAndSelect('pago.estudiante', 'estudiante')
      .leftJoinAndSelect('estudiante.persona', 'persona')
      .leftJoinAndSelect('pago.concepto', 'concepto')
      .leftJoinAndSelect('pago.receptor', 'receptor');

    if (gestion) {
      consulta.andWhere('pago.gestion = :gestion', { gestion });
    }

    if (estado) {
      consulta.andWhere('pago.estado = :estado', { estado });
    }

    if (estudianteId) {
      consulta.andWhere('pago.estudianteId = :estudianteId', { estudianteId });
    }

    if (conceptoId) {
      consulta.andWhere('pago.conceptoId = :conceptoId', { conceptoId });
    }

    const [datos, total] = await consulta
      .orderBy('pago.fechaPago', 'DESC')
      .skip((pagina - 1) * limite)
      .take(limite)
      .getManyAndCount();

    return { datos, total, pagina, limite };
  }

  async obtenerUno(id: number): Promise<Pago> {
    const pago = await this.repositorioPago.findOne({
      where: { id },
      relations: ['estudiante', 'estudiante.persona', 'concepto', 'receptor'],
    });
    if (!pago) {
      throw new NotFoundException(`Pago con ID ${id} no encontrado`);
    }
    return pago;
  }

  async actualizar(id: number, actualizarPagoDto: ActualizarPagoDto): Promise<Pago> {
    const pago = await this.obtenerUno(id);
    Object.assign(pago, actualizarPagoDto);
    return this.repositorioPago.save(pago as any);
  }

  async eliminar(id: number): Promise<void> {
    const pago = await this.obtenerUno(id);
    await this.repositorioPago.remove(pago);
  }

  async buscarPorEstudiante(estudianteId: number, gestion?: string): Promise<Pago[]> {
    const consulta = this.repositorioPago
      .createQueryBuilder('pago')
      .leftJoinAndSelect('pago.concepto', 'concepto')
      .leftJoinAndSelect('pago.receptor', 'receptor')
      .where('pago.estudianteId = :estudianteId', { estudianteId });

    if (gestion) {
      consulta.andWhere('pago.gestion = :gestion', { gestion });
    }

    return consulta.orderBy('pago.fechaPago', 'DESC').getMany();
  }

  async obtenerDeudaEstudiante(estudianteId: number, gestion: string): Promise<{ totalPaid: number; pending: number }> {
    const pagos = await this.repositorioPago.find({
      where: { estudianteId, gestion, estado: EstadoPago.PAGADO },
    });

    const totalPagado = pagos.reduce((suma, pago) => suma + Number(pago.monto), 0);

    return { totalPaid: totalPagado, pending: 0 };
  }

  async obtenerPagosPorRangoFechas(
    fechaInicio: Date,
    fechaFin: Date,
    gestion?: string,
  ): Promise<Pago[]> {
    const consulta = this.repositorioPago
      .createQueryBuilder('pago')
      .leftJoinAndSelect('pago.estudiante', 'estudiante')
      .leftJoinAndSelect('estudiante.persona', 'persona')
      .leftJoinAndSelect('pago.concepto', 'concepto')
      .where('pago.fechaPago BETWEEN :fechaInicio AND :fechaFin', { fechaInicio, fechaFin })
      .andWhere('pago.estado = :estado', { estado: EstadoPago.PAGADO });

    if (gestion) {
      consulta.andWhere('pago.gestion = :gestion', { gestion });
    }

    return consulta.orderBy('pago.fechaPago', 'DESC').getMany();
  }

  async obtenerRecaudacionDiaria(fecha: string, gestion: string): Promise<{ total: number; count: number }> {
    const fechaInicio = new Date(fecha);
    const fechaFin = new Date(fecha);
    fechaFin.setHours(23, 59, 59);

    const pagos = await this.repositorioPago
      .createQueryBuilder('pago')
      .where('pago.fechaPago BETWEEN :fechaInicio AND :fechaFin', { fechaInicio, fechaFin })
      .andWhere('pago.gestion = :gestion', { gestion })
      .andWhere('pago.estado = :estado', { estado: EstadoPago.PAGADO })
      .getMany();

    const total = pagos.reduce((suma, pago) => suma + Number(pago.monto), 0);

    return { total, count: pagos.length };
  }

  async anular(id: number): Promise<Pago> {
    const pago = await this.obtenerUno(id);
    pago.estado = EstadoPago.ANULADO;
    return this.repositorioPago.save(pago as any);
  }

  async obtenerResumenRecaudacion(gestion: string): Promise<{
    total: number;
    byMethod: { method: MetodoPago; total: number }[];
    byConcept: { concept: string; total: number }[];
  }> {
    const pagos = await this.repositorioPago.find({
      where: { gestion, estado: EstadoPago.PAGADO },
      relations: ['concepto'],
    });

    const total = pagos.reduce((suma, pago) => suma + Number(pago.monto), 0);

    const mapaPorMetodo = new Map<MetodoPago, number>();
    const mapaPorConcepto = new Map<string, number>();

    pagos.forEach((pago) => {
      mapaPorMetodo.set(pago.metodoPago, (mapaPorMetodo.get(pago.metodoPago) || 0) + Number(pago.monto));
      mapaPorConcepto.set(pago.concepto?.nombre || 'Unknown', (mapaPorConcepto.get(pago.concepto?.nombre || 'Unknown') || 0) + Number(pago.monto));
    });

    return {
      total,
      byMethod: Array.from(mapaPorMetodo.entries()).map(([metodo, total]) => ({ method: metodo, total })),
      byConcept: Array.from(mapaPorConcepto.entries()).map(([concepto, total]) => ({ concept: concepto, total })),
    };
  }
}
