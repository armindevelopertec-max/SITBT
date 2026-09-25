import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificado } from '../../entities/certificado.entity';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { UpdateCertificateDto } from './dto/update-certificate.dto';

@Injectable()
export class CertificatesService {
  constructor(
    @InjectRepository(Certificado)
    private certificateRepository: Repository<Certificado>,
  ) {}

  async create(createDto: CreateCertificateDto): Promise<Certificado> {
    const certificate = this.certificateRepository.create(createDto);
    return this.certificateRepository.save(certificate);
  }

  async findAll(
    page = 1,
    limit = 20,
    gestion?: string,
    type?: string,
    studentId?: number,
  ): Promise<{ data: Certificado[]; total: number; page: number; limit: number }> {
    const query = this.certificateRepository
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
    const certificate = await this.certificateRepository.findOne({
      where: { id },
      relations: ['student', 'student.person', 'issuer'],
    });
    if (!certificate) {
      throw new NotFoundException(`Certificate with ID ${id} not found`);
    }
    return certificate;
  }

  async findByCode(code: string): Promise<Certificado> {
    const certificate = await this.certificateRepository.findOne({
      where: { code },
      relations: ['student', 'student.person', 'issuer'],
    });
    if (!certificate) {
      throw new NotFoundException(`Certificate with code ${code} not found`);
    }
    return certificate;
  }

  async update(id: number, updateDto: UpdateCertificateDto): Promise<Certificado> {
    const certificate = await this.findOne(id);
    Object.assign(certificate, updateDto);
    return this.certificateRepository.save(certificate);
  }

  async remove(id: number): Promise<void> {
    const certificate = await this.findOne(id);
    await this.certificateRepository.remove(certificate);
  }

  async findByStudent(studentId: number): Promise<Certificado[]> {
    return this.certificateRepository.find({
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