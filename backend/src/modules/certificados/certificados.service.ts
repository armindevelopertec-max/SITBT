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
  ): Promise<{ data: Certificado[]; total: number; page: number; limit: number }> {
    const query = this.certificadoRepository
      .createQueryBuilder('certificate')
      .leftJoinAndSelect('certificate.student', 'student')
      .leftJoinAndSelect('student.person', 'person')
      .leftJoinAndSelect('certificate.issuer', 'issuer');

    if (gestion) {
      query.andWhere('EXTRACT(YEAR FROM certificate.date) = :gestion', { gestion });
    }

    if (type) {
      query.andWhere('certificate.type = :type', { type });
    }

    if (studentId) {
      query.andWhere('certificate.student_id = :studentId', { studentId });
    }

    const [data, total] = await query
      .orderBy('certificate.date', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Certificado> {
    const certificate = await this.certificadoRepository.findOne({
      where: { id },
      relations: ['student', 'student.person', 'issuer'],
    });
    if (!certificate) {
      throw new NotFoundException(`Certificado con ID ${id} no encontrado`);
    }
    return certificate;
  }

  async findByCode(code: string): Promise<Certificado> {
    const certificate = await this.certificadoRepository.findOne({
      where: { code },
      relations: ['student', 'student.person', 'issuer'],
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
      where: { student_id: studentId },
      relations: ['issuer'],
      order: { date: 'DESC' },
    });
  }

  async verifyCertificate(code: string): Promise<{ valid: boolean; certificate?: Certificado }> {
    const certificate = await this.findByCode(code);
    if (certificate) {
      return { valid: true, certificate };
    }
    return { valid: false };
  }
}