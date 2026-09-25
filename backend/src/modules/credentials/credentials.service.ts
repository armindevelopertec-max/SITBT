import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Credencial, CredentialStatus } from '../../entities/credencial.entity';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { UpdateCredentialDto } from './dto/update-credential.dto';

@Injectable()
export class CredentialsService {
  constructor(
    @InjectRepository(Credencial)
    private credentialRepository: Repository<Credencial>,
  ) {}

  async create(createDto: CreateCredentialDto): Promise<Credencial> {
    const credential = this.credentialRepository.create(createDto);
    return this.credentialRepository.save(credential);
  }

  async findAll(
    page = 1,
    limit = 20,
    gestion?: string,
    status?: CredentialStatus,
  ): Promise<{ data: Credencial[]; total: number; page: number; limit: number }> {
    const query = this.credentialRepository
      .createQueryBuilder('credential')
      .leftJoinAndSelect('credential.student', 'student')
      .leftJoinAndSelect('student.person', 'person')
      .leftJoinAndSelect('credential.issuer', 'issuer');

    if (gestion) {
      query.andWhere('credential.gestion = :gestion', { gestion });
    }

    if (status) {
      query.andWhere('credential.status = :status', { status });
    }

    const [data, total] = await query
      .orderBy('credential.issued_date', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Credencial> {
    const credential = await this.credentialRepository.findOne({
      where: { id },
      relations: ['student', 'student.person', 'issuer'],
    });
    if (!credential) {
      throw new NotFoundException(`Credential with ID ${id} not found`);
    }
    return credential;
  }

  async findByCode(code: string): Promise<Credencial> {
    const credential = await this.credentialRepository.findOne({
      where: { code },
      relations: ['student', 'student.person', 'issuer'],
    });
    if (!credential) {
      throw new NotFoundException(`Credential with code ${code} not found`);
    }
    return credential;
  }

  async update(id: number, updateDto: UpdateCredentialDto): Promise<Credencial> {
    const credential = await this.findOne(id);
    Object.assign(credential, updateDto);
    return this.credentialRepository.save(credential);
  }

  async remove(id: number): Promise<void> {
    const credential = await this.findOne(id);
    await this.credentialRepository.remove(credential);
  }

  async findByStudent(studentId: number): Promise<Credencial[]> {
    return this.credentialRepository.find({
      where: { student_id: studentId },
      relations: ['issuer'],
      order: { issued_date: 'DESC' },
    });
  }

  async findActiveByStudent(studentId: number): Promise<Credencial | null> {
    return this.credentialRepository.findOne({
      where: { student_id: studentId, status: CredentialStatus.EMITIDA },
      relations: ['issuer'],
      order: { issued_date: 'DESC' },
    });
  }

  async markAsPrinted(id: number): Promise<Credencial> {
    const credential = await this.findOne(id);
    credential.printed = true;
    return this.credentialRepository.save(credential);
  }

  async annul(id: number): Promise<Credencial> {
    const credential = await this.findOne(id);
    credential.status = CredentialStatus.ANULADA;
    return this.credentialRepository.save(credential);
  }
}