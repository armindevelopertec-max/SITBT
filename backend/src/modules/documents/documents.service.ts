import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmittedDocument, DocumentType, DocumentStatus } from '../../entities/emitted-document.entity';
import { CreateEmittedDocumentDto } from './dto/create-emitted-document.dto';
import { UpdateEmittedDocumentDto } from './dto/update-emitted-document.dto';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(EmittedDocument)
    private documentRepository: Repository<EmittedDocument>,
  ) {}

  async create(createDto: CreateEmittedDocumentDto): Promise<EmittedDocument> {
    const document = this.documentRepository.create(createDto as Partial<EmittedDocument>);
    return this.documentRepository.save(document);
  }

  async findAll(
    page = 1,
    limit = 20,
    tipo?: DocumentType,
    gestion?: string,
    estudianteId?: number,
    estado?: DocumentStatus,
  ): Promise<{ data: EmittedDocument[]; total: number; page: number; limit: number }> {
    const query = this.documentRepository
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
    const document = await this.documentRepository.findOne({
      where: { id },
      relations: ['estudiante', 'estudiante.person', 'gestionEntity', 'impresor'],
    });
    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }
    return document;
  }

  async findByStudent(estudianteId: number, tipo?: DocumentType): Promise<EmittedDocument[]> {
    const query = this.documentRepository
      .createQueryBuilder('document')
      .where('document.estudiante_id = :estudianteId', { estudianteId });

    if (tipo) {
      query.andWhere('document.tipo = :tipo', { tipo });
    }

    return query.orderBy('document.fechaEmision', 'DESC').getMany();
  }

  async update(id: string, updateDto: UpdateEmittedDocumentDto): Promise<EmittedDocument> {
    const document = await this.findOne(id);

    if (updateDto.estado === DocumentStatus.ENTREGADO && !document.fechaEntrega) {
      document.fechaEntrega = new Date();
    }

    Object.assign(document, updateDto);
    return this.documentRepository.save(document);
  }

  async markAsPrinted(id: string, impresoPor: number): Promise<EmittedDocument> {
    return this.update(id, {
      estado: DocumentStatus.IMPRESO,
      impreso_por: impresoPor,
    });
  }

  async markAsDelivered(id: string, entregadoA: string): Promise<EmittedDocument> {
    const document = await this.findOne(id);
    document.estado = DocumentStatus.ENTREGADO;
    document.entregadoA = entregadoA;
    document.fechaEntrega = new Date();
    return this.documentRepository.save(document);
  }

  async annul(id: string, observaciones?: string): Promise<EmittedDocument> {
    return this.update(id, {
      estado: DocumentStatus.ANULADO,
      observaciones,
    } as UpdateEmittedDocumentDto);
  }

  async generateBoletaInscripcion(
    estudianteId: number,
    gestion: string,
    gestionId?: number,
  ): Promise<EmittedDocument> {
    const numeroDocumento = `BOL-INS-${gestion}-${Date.now()}`;

    return this.create({
      estudiante_id: estudianteId,
      tipo: DocumentType.BOLETA_INSCRIPCION,
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
      tipo: DocumentType.RECIBO_PAGO,
      numeroDocumento,
      gestion,
      gestion_id: gestionId,
      related_payment_id: paymentId,
    });
  }

  async getDocumentStatistics(gestion?: string): Promise<{
    total: number;
    byType: { tipo: DocumentType; count: number }[];
    byStatus: { estado: DocumentStatus; count: number }[];
  }> {
    const query = this.documentRepository.createQueryBuilder('document');

    if (gestion) {
      query.where('document.gestion = :gestion', { gestion });
    }

    const documents = await query.getMany();

    const byTypeMap = new Map<DocumentType, number>();
    const byStatusMap = new Map<DocumentStatus, number>();

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
    await this.documentRepository.remove(document);
  }
}
