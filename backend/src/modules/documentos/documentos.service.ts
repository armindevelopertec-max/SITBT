import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentoEmitido, TipoDocumento, EstadoDocumento } from '../../entities/emitted-document.entity';
import { CrearDocumentoEmitidoDto } from './dto/crear-documento-emitido.dto';
import { ActualizarDocumentoEmitidoDto } from './dto/actualizar-documento-emitido.dto';

@Injectable()
export class ServicioDocumentos {
  constructor(
    @InjectRepository(DocumentoEmitido)
    private documentoRepository: Repository<DocumentoEmitido>,
  ) {}

  async create(createDto: CrearDocumentoEmitidoDto): Promise<DocumentoEmitido> {
    const document = this.documentoRepository.create(createDto as Partial<DocumentoEmitido>);
    return this.documentoRepository.save(document);
  }

  async findAll(
    page = 1,
    limit = 20,
    tipo?: TipoDocumento,
    gestion?: string,
    estudianteId?: number,
    estado?: EstadoDocumento,
  ): Promise<{ data: DocumentoEmitido[]; total: number; page: number; limit: number }> {
    const query = this.documentoRepository
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.estudiante', 'estudiante')
      .leftJoinAndSelect('estudiante.persona', 'person')
      .leftJoinAndSelect('document.gestionEntity', 'gestion');

    if (tipo) {
      query.andWhere('document.tipo = :tipo', { tipo: tipo });
    }

    if (gestion) {
      query.andWhere('document.gestion = :gestion', { gestion });
    }

    if (estudianteId) {
      query.andWhere('document.estudianteId = :estudianteId', { estudianteId });
    }

    if (estado) {
      query.andWhere('document.estado = :estado', { estado: estado });
    }

    const [data, total] = await query
      .orderBy('document.fechaEmision', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<DocumentoEmitido> {
    const document = await this.documentoRepository.findOne({
      where: { id },
      relations: ['estudiante', 'estudiante.persona', 'gestionEntity', 'impresor'],
    });
    if (!document) {
      throw new NotFoundException(`Documento con ID ${id} no encontrado`);
    }
    return document;
  }

  async findByStudent(estudianteId: number, tipo?: TipoDocumento): Promise<DocumentoEmitido[]> {
    const query = this.documentoRepository
      .createQueryBuilder('document')
      .where('document.estudianteId = :estudianteId', { estudianteId });

    if (tipo) {
      query.andWhere('document.tipo = :tipo', { tipo: tipo });
    }

    return query.orderBy('document.fechaEmision', 'DESC').getMany();
  }

  async update(id: string, updateDto: ActualizarDocumentoEmitidoDto): Promise<DocumentoEmitido> {
    const document = await this.findOne(id);

    if (updateDto.estado === EstadoDocumento.ENTREGADO && !document.fechaEntrega) {
      document.fechaEntrega = new Date();
    }

    Object.assign(document, updateDto);
    return this.documentoRepository.save(document);
  }

  async markAsPrinted(id: string, impresoPor: number): Promise<DocumentoEmitido> {
    return this.update(id, {
      estado: EstadoDocumento.IMPRESO,
      impresoPor: impresoPor,
    });
  }

  async markAsDelivered(id: string, entregadoA: string): Promise<DocumentoEmitido> {
    const document = await this.findOne(id);
    document.estado = EstadoDocumento.ENTREGADO;
    document.entregadoA = entregadoA;
    document.fechaEntrega = new Date();
    return this.documentoRepository.save(document);
  }

  async annul(id: string, observaciones?: string): Promise<DocumentoEmitido> {
    return this.update(id, {
      estado: EstadoDocumento.ANULADO,
      observaciones,
    } as ActualizarDocumentoEmitidoDto);
  }

  async generateBoletaInscripcion(
    estudianteId: number,
    gestion: string,
    gestionId?: number,
  ): Promise<DocumentoEmitido> {
    const numeroDocumento = `BOL-INS-${gestion}-${Date.now()}`;

    return this.create({
      estudianteId: estudianteId,
      tipo: TipoDocumento.BOLETA_INSCRIPCION,
      numeroDocumento,
      gestion,
      gestionId: gestionId,
    });
  }

  async generateReciboPago(
    estudianteId: number,
    gestion: string,
    paymentId: number,
    gestionId?: number,
  ): Promise<DocumentoEmitido> {
    const numeroDocumento = `REC-PAG-${gestion}-${Date.now()}`;

    return this.create({
      estudianteId: estudianteId,
      tipo: TipoDocumento.RECIBO_PAGO,
      numeroDocumento,
      gestion,
      gestionId: gestionId,
      pagoRelacionadoId: paymentId,
    });
  }

  async getDocumentStatistics(gestion?: string): Promise<{
    total: number;
    porTipo: { tipo: TipoDocumento; cantidad: number }[];
    porEstado: { estado: EstadoDocumento; cantidad: number }[];
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
      porTipo: Array.from(byTypeMap.entries()).map(([tipo, count]) => ({ tipo, cantidad: count })),
      porEstado: Array.from(byStatusMap.entries()).map(([estado, count]) => ({ estado, cantidad: count })),
    };
  }

  async remove(id: string): Promise<void> {
    const document = await this.findOne(id);
    await this.documentoRepository.remove(document);
  }
}
