import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
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
    const existing = await this.credentialRepository.findOne({
      where: {
        student_id: createDto.student_id,
        gestion: createDto.gestion,
        semester: createDto.semester,
      },
    });

    if (existing) {
      throw new ConflictException(`Ya existe una credencial para este estudiante en la gestión ${createDto.gestion} semestre ${createDto.semester}`);
    }

    const credential = this.credentialRepository.create(createDto);
    return this.credentialRepository.save(credential);
  }

  async findAll(
    page = 1,
    limit = 20,
    gestion?: string,
    semester?: number,
    status?: CredentialStatus,
  ): Promise<{ data: Credencial[]; total: number; page: number; limit: number }> {
    const query = this.credentialRepository
      .createQueryBuilder('credential')
      .leftJoinAndSelect('credential.estudiante', 'student')
      .leftJoinAndSelect('student.persona', 'person')
      .leftJoinAndSelect('credential.emisor', 'issuer');

    if (gestion) {
      query.andWhere('credential.gestion = :gestion', { gestion });
    }

    if (semester) {
      query.andWhere('credential.semester = :semester', { semester });
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
      relations: ['estudiante', 'estudiante.persona', 'estudiante.carrera', 'emisor'],
    });
    if (!credential) {
      throw new NotFoundException(`Credential with ID ${id} not found`);
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
      relations: ['emisor', 'estudiante'],
      order: { issued_date: 'DESC' },
    });
  }

  async findActiveByStudent(studentId: number): Promise<Credencial | null> {
    return this.credentialRepository.findOne({
      where: { student_id: studentId, status: CredentialStatus.EMITIDA },
      relations: ['emisor'],
      order: { issued_date: 'DESC' },
    });
  }

  async findByStudentAndGestion(studentId: number, gestion: string): Promise<Credencial[]> {
    return this.credentialRepository.find({
      where: { student_id: studentId, gestion },
      relations: ['emisor', 'estudiante', 'estudiante.persona'],
      order: { semester: 'ASC' },
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
