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
    private repositorioDocumento: Repository<DocumentoEmitido>,
  ) {}

  async crear(crearDto: CrearDocumentoEmitidoDto): Promise<DocumentoEmitido> {
    const documento = this.repositorioDocumento.create(crearDto as Partial<DocumentoEmitido>);
    return this.repositorioDocumento.save(documento);
  }

  async obtenerTodos(
    pagina = 1,
    limite = 20,
    tipo?: TipoDocumento,
    gestion?: string,
    estudianteId?: number,
    estado?: EstadoDocumento,
  ): Promise<{ datos: DocumentoEmitido[]; total: number; pagina: number; limite: number }> {
    const consulta = this.repositorioDocumento
      .createQueryBuilder('documento')
      .leftJoinAndSelect('documento.estudiante', 'estudiante')
      .leftJoinAndSelect('estudiante.persona', 'persona')
      .leftJoinAndSelect('documento.gestionRelacionada', 'gestion');

    if (tipo) {
      consulta.andWhere('documento.tipo = :tipo', { tipo: tipo });
    }

    if (gestion) {
      consulta.andWhere('documento.gestion = :gestion', { gestion });
    }

    if (estudianteId) {
      consulta.andWhere('documento.estudianteId = :estudianteId', { estudianteId });
    }

    if (estado) {
      consulta.andWhere('documento.estado = :estado', { estado: estado });
    }

    const [datos, total] = await consulta
      .orderBy('documento.fechaEmision', 'DESC')
      .skip((pagina - 1) * limite)
      .take(limite)
      .getManyAndCount();

    return { datos, total, pagina, limite };
  }

  async obtenerUno(id: string): Promise<DocumentoEmitido> {
    const documento = await this.repositorioDocumento.findOne({
      where: { id },
      relations: ['estudiante', 'estudiante.persona', 'gestionRelacionada', 'impresor'],
    });
    if (!documento) {
      throw new NotFoundException(`Documento con ID ${id} no encontrado`);
    }
    return documento;
  }

  async buscarPorEstudiante(estudianteId: number, tipo?: TipoDocumento): Promise<DocumentoEmitido[]> {
    const consulta = this.repositorioDocumento
      .createQueryBuilder('documento')
      .where('documento.estudianteId = :estudianteId', { estudianteId });

    if (tipo) {
      consulta.andWhere('documento.tipo = :tipo', { tipo: tipo });
    }

    return consulta.orderBy('documento.fechaEmision', 'DESC').getMany();
  }

  async actualizar(id: string, actualizarDto: ActualizarDocumentoEmitidoDto): Promise<DocumentoEmitido> {
    const documento = await this.obtenerUno(id);

    if (actualizarDto.estado === EstadoDocumento.ENTREGADO && !documento.fechaEntrega) {
      documento.fechaEntrega = new Date();
    }

    Object.assign(documento, actualizarDto);
    return this.repositorioDocumento.save(documento);
  }

  async marcarComoImpreso(id: string, impresoPor: number): Promise<DocumentoEmitido> {
    return this.actualizar(id, {
      estado: EstadoDocumento.IMPRESO,
      impresoPor: impresoPor,
    });
  }

  async marcarComoEntregado(id: string, entregadoA: string): Promise<DocumentoEmitido> {
    const documento = await this.obtenerUno(id);
    documento.estado = EstadoDocumento.ENTREGADO;
    documento.entregadoA = entregadoA;
    documento.fechaEntrega = new Date();
    return this.repositorioDocumento.save(documento);
  }

  async anular(id: string, observaciones?: string): Promise<DocumentoEmitido> {
    return this.actualizar(id, {
      estado: EstadoDocumento.ANULADO,
      observaciones,
    } as ActualizarDocumentoEmitidoDto);
  }

  async generarBoletaInscripcion(
    estudianteId: number,
    gestion: string,
    gestionId?: number,
  ): Promise<DocumentoEmitido> {
    const numeroDocumento = `BOL-INS-${gestion}-${Date.now()}`;

    return this.crear({
      estudianteId: estudianteId,
      tipo: TipoDocumento.BOLETA_INSCRIPCION,
      numeroDocumento,
      gestion,
      gestionId: gestionId,
    });
  }

  async generarReciboPago(
    estudianteId: number,
    gestion: string,
    pagoId: number,
    gestionId?: number,
  ): Promise<DocumentoEmitido> {
    const numeroDocumento = `REC-PAG-${gestion}-${Date.now()}`;

    return this.crear({
      estudianteId: estudianteId,
      tipo: TipoDocumento.RECIBO_PAGO,
      numeroDocumento,
      gestion,
      gestionId: gestionId,
      pagoRelacionadoId: pagoId,
    });
  }

  async obtenerEstadisticasDocumentos(gestion?: string): Promise<{
    total: number;
    porTipo: { tipo: TipoDocumento; cantidad: number }[];
    porEstado: { estado: EstadoDocumento; cantidad: number }[];
  }> {
    const consulta = this.repositorioDocumento.createQueryBuilder('documento');

    if (gestion) {
      consulta.where('documento.gestion = :gestion', { gestion });
    }

    const documentos = await consulta.getMany();

    const mapaPorTipo = new Map<TipoDocumento, number>();
    const mapaPorEstado = new Map<EstadoDocumento, number>();

    documentos.forEach((documento) => {
      mapaPorTipo.set(documento.tipo, (mapaPorTipo.get(documento.tipo) || 0) + 1);
      mapaPorEstado.set(documento.estado, (mapaPorEstado.get(documento.estado) || 0) + 1);
    });

    return {
      total: documentos.length,
      porTipo: Array.from(mapaPorTipo.entries()).map(([tipo, conteo]) => ({ tipo, cantidad: conteo })),
      porEstado: Array.from(mapaPorEstado.entries()).map(([estado, conteo]) => ({ estado, cantidad: conteo })),
    };
  }

  async eliminar(id: string): Promise<void> {
    const documento = await this.obtenerUno(id);
    await this.repositorioDocumento.remove(documento);
  }
}
