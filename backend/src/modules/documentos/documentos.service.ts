import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmittedDocument, TipoDocumento, EstadoDocumento } from '../../entities/emitted-document.entity';
import { CrearDocumentoEmitidoDto } from './dto/crear-documento-emitido.dto';
import { ActualizarDocumentoEmitidoDto } from './dto/actualizar-documento-emitido.dto';

@Injectable()
export class ServicioDocumentos {
  constructor(
    @InjectRepository(EmittedDocument)
    private documentoRepository: Repository<EmittedDocument>,
  ) {}

  async create(createDto: CrearDocumentoEmitidoDto): Promise<EmittedDocument> {
    const document = this.documentoRepository.create(createDto as Partial<EmittedDocument>);
    return this.documentoRepository.save(document);
  }

  async findAll(
    page = 1,
    limit = 20,
    tipo?: TipoDocumento,
    gestion?: string,
    estudianteId?: number,
    estado?: EstadoDocumento,
  ): Promise<{ data: EmittedDocument[]; total: number; page: number; limit: number }> {
    const query = this.documentoRepository
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.estudiante', 'estudiante')
      .leftJoinAndSelect('estudiante.person', 'person')
      .leftJoinAndSelect('document.gestionEntity', 'gestion');

    if (tipo) {
      query.andWhere('document.tipo = :tipo', { tipo });
    }

    if (gestion) {
      query.andWhere('document.gestion = :gestion', { gestion });
    }

    if (estudianteId) {
      query.andWhere('document.estudiante_id = :estudianteId', { estudianteId });
    }

    if (estado) {
      query.andWhere('document.estado = :estado', { estado });
    }

    const [data, total] = await query
      .orderBy('document.fechaEmision', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<EmittedDocument> {
    const document = await this.documentoRepository.findOne({
      where: { id },
      relations: ['estudiante', 'estudiante.person', 'gestionEntity', 'impresor'],
    });
    if (!document) {
      throw new NotFoundException(`Documento con ID ${id} no encontrado`);
    }
    return document;
  }

  async findByStudent(estudianteId: number, tipo?: TipoDocumento): Promise<EmittedDocument[]> {
    const query = this.documentoRepository
      .createQueryBuilder('document')
      .where('document.estudiante_id = :estudianteId', { estudianteId });

    if (tipo) {
      query.andWhere('document.tipo = :tipo', { tipo });
    }

    return query.orderBy('document.fechaEmision', 'DESC').getMany();
  }

  async update(id: string, updateDto: ActualizarDocumentoEmitidoDto): Promise<EmittedDocument> {
    const document = await this.findOne(id);

    if (updateDto.estado === EstadoDocumento.ENTREGADO && !document.fechaEntrega) {
      document.fechaEntrega = new Date();
    }

    Object.assign(document, updateDto);
    return this.documentoRepository.save(document);
  }

  async markAsPrinted(id: string, impresoPor: number): Promise<EmittedDocument> {
    return this.update(id, {
      estado: EstadoDocumento.IMPRESO,
      impreso_por: impresoPor,
    });
  }

  async markAsDelivered(id: string, entregadoA: string): Promise<EmittedDocument> {
    const document = await this.findOne(id);
    document.estado = EstadoDocumento.ENTREGADO;
    document.entregadoA = entregadoA;
    document.fechaEntrega = new Date();
    return this.documentoRepository.save(document);
  }

  async annul(id: string, observaciones?: string): Promise<EmittedDocument> {
    return this.update(id, {
      estado: EstadoDocumento.ANULADO,
      observaciones,
    } as ActualizarDocumentoEmitidoDto);
  }

  async generateBoletaInscripcion(
    estudianteId: number,
    gestion: string,
    gestionId?: number,
  ): Promise<EmittedDocument> {
    const numeroDocumento = `BOL-INS-${gestion}-${Date.now()}`;

    return this.create({
      estudiante_id: estudianteId,
      tipo: TipoDocumento.BOLETA_INSCRIPCION,
      numeroDocumento,
      gestion,
      gestion_id: gestionId,
    });
  }

  async generateReciboPago(
    estudianteId: number,
    gestion: string,
    paymentId: number,
    gestionId?: number,
  ): Promise<EmittedDocument> {
    const numeroDocumento = `REC-PAG-${gestion}-${Date.now()}`;

    return this.create({
      estudiante_id: estudianteId,
      tipo: TipoDocumento.RECIBO_PAGO,
      numeroDocumento,
      gestion,
      gestion_id: gestionId,
      related_payment_id: paymentId,
    });
  }

  async getDocumentStatistics(gestion?: string): Promise<{
    total: number;
    byType: { tipo: TipoDocumento; count: number }[];
    byStatus: { estado: EstadoDocumento; count: number }[];
  }> {
    const query = this.documentoRepository.createQueryBuilder('document');

    if (gestion) {
      query.where('document.gestion = :gestion', { gestion });
    }

    const documents = await query.getMany();

    const byTypeMap = new Map<TipoDocumento, number>();
    const byStatusMap = new Map<EstadoDocumento, number>();

    documents.forEach((doc) => {
      byTypeMap.set(doc.tipo, (byTypeMap.get(doc.tipo) || 0) + 1);
      byStatusMap.set(doc.estado, (byStatusMap.get(doc.estado) || 0) + 1);
    });

    return {
      total: documents.length,
      byType: Array.from(byTypeMap.entries()).map(([tipo, count]) => ({ tipo, count })),
      byStatus: Array.from(byStatusMap.entries()).map(([estado, count]) => ({ estado, count })),
    };
  }

  async remove(id: string): Promise<void> {
    const document = await this.findOne(id);
    await this.documentoRepository.remove(document);
  }
}
