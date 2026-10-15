import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificado } from '../../entities/certificado.entity';
import { CrearCertificadoDto } from './dto/crear-certificado.dto';
import { ActualizarCertificadoDto } from './dto/actualizar-certificado.dto';

@Injectable()
export class ServicioCertificados {
  constructor(
    @InjectRepository(Certificado)
    private repositorioCertificado: Repository<Certificado>,
  ) {}

  async crear(dtoCreacion: CrearCertificadoDto): Promise<Certificado> {
    const certificado = this.repositorioCertificado.create(dtoCreacion);
    return this.repositorioCertificado.save(certificado);
  }

  async obtenerTodos(
    pagina = 1,
    limite = 20,
    gestion?: string,
    tipo?: string,
    estudianteId?: number,
  ): Promise<{ datos: Certificado[]; total: number; pagina: number; limite: number }> {
    const consulta = this.repositorioCertificado
      .createQueryBuilder('certificado')
      .leftJoinAndSelect('certificado.estudiante', 'estudiante')
      .leftJoinAndSelect('estudiante.persona', 'persona')
      .leftJoinAndSelect('certificado.emisor', 'emisor');

    if (gestion) {
      consulta.andWhere('EXTRACT(YEAR FROM certificado.fecha) = :gestion', { gestion });
    }

    if (tipo) {
      consulta.andWhere('certificado.tipo = :tipo', { tipo });
    }

    if (estudianteId) {
      consulta.andWhere('certificado.estudianteId = :estudianteId', { estudianteId });
    }

    const [datos, total] = await consulta
      .orderBy('certificado.fecha', 'DESC')
      .skip((pagina - 1) * limite)
      .take(limite)
      .getManyAndCount();

    return { datos, total, pagina, limite };
  }

  async obtenerUno(id: number): Promise<Certificado> {
    const certificado = await this.repositorioCertificado.findOne({
      where: { id },
      relations: ['estudiante', 'estudiante.persona', 'emisor'],
    });
    if (!certificado) {
      throw new NotFoundException(`Certificado con ID ${id} no encontrado`);
    }
    return certificado;
  }

  async buscarPorCodigo(codigo: string): Promise<Certificado> {
    const certificado = await this.repositorioCertificado.findOne({
      where: { codigo },
      relations: ['estudiante', 'estudiante.persona', 'emisor'],
    });
    if (!certificado) {
      throw new NotFoundException(`Certificado con código ${codigo} no encontrado`);
    }
    return certificado;
  }

  async actualizar(id: number, dtoActualizacion: ActualizarCertificadoDto): Promise<Certificado> {
    const certificado = await this.obtenerUno(id);
    Object.assign(certificado, dtoActualizacion);
    return this.repositorioCertificado.save(certificado);
  }

  async eliminar(id: number): Promise<void> {
    const certificado = await this.obtenerUno(id);
    await this.repositorioCertificado.remove(certificado);
  }

  async buscarPorEstudiante(estudianteId: number): Promise<Certificado[]> {
    return this.repositorioCertificado.find({
      where: { estudianteId },
      relations: ['emisor'],
      order: { fecha: 'DESC' },
    });
  }

  async verificarCertificado(codigo: string): Promise<{ valido: boolean; certificado?: Certificado }> {
    const certificado = await this.buscarPorCodigo(codigo);
    if (certificado) {
      return { valido: true, certificado };
    }
    return { valido: false };
  }
}
