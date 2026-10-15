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
    private certificadoRepository: Repository<Certificado>,
  ) {}

  async create(createDto: CrearCertificadoDto): Promise<Certificado> {
    const certificate = this.certificadoRepository.create(createDto);
    return this.certificadoRepository.save(certificate);
  }

  async findAll(
    page = 1,
    limit = 20,
    gestion?: string,
    type?: string,
    studentId?: number,
  ): Promise<{ datos: Certificado[]; total: number; pagina: number; limite: number }> {
    const query = this.certificadoRepository
      .createQueryBuilder('certificate')
      .leftJoinAndSelect('certificate.estudiante', 'student')
      .leftJoinAndSelect('student.persona', 'person')
      .leftJoinAndSelect('certificate.emisor', 'issuer');

    if (gestion) {
      query.andWhere('EXTRACT(YEAR FROM certificate.fecha) = :gestion', { gestion });
    }

    if (type) {
      query.andWhere('certificate.tipo = :tipo', { tipo: type });
    }

    if (studentId) {
      query.andWhere('certificate.estudianteId = :studentId', { studentId });
    }

    const [data, total] = await query
      .orderBy('certificate.fecha', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { datos: data, total, pagina: page, limite: limit };
  }

  async findOne(id: number): Promise<Certificado> {
    const certificate = await this.certificadoRepository.findOne({
      where: { id },
      relations: ['estudiante', 'estudiante.persona', 'emisor'],
    });
    if (!certificate) {
      throw new NotFoundException(`Certificado con ID ${id} no encontrado`);
    }
    return certificate;
  }

  async findByCode(code: string): Promise<Certificado> {
    const certificate = await this.certificadoRepository.findOne({
      where: { codigo: code },
      relations: ['estudiante', 'estudiante.persona', 'emisor'],
    });
    if (!certificate) {
      throw new NotFoundException(`Certificado con código ${code} no encontrado`);
    }
    return certificate;
  }

  async update(id: number, updateDto: ActualizarCertificadoDto): Promise<Certificado> {
    const certificate = await this.findOne(id);
    Object.assign(certificate, updateDto);
    return this.certificadoRepository.save(certificate);
  }

  async remove(id: number): Promise<void> {
    const certificate = await this.findOne(id);
    await this.certificadoRepository.remove(certificate);
  }

  async findByStudent(studentId: number): Promise<Certificado[]> {
    return this.certificadoRepository.find({
      where: { estudianteId: studentId },
      relations: ['emisor'],
      order: { fecha: 'DESC' },
    });
  }

  async verifyCertificate(code: string): Promise<{ valido: boolean; certificado?: Certificado }> {
    const certificate = await this.findByCode(code);
    if (certificate) {
      return { valido: true, certificado: certificate };
    }
    return { valido: false };
  }
}