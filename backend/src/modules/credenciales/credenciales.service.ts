import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Credencial, EstadoCredencial } from '../../entities/credencial.entity';
import { CrearCredencialDto } from './dto/crear-credencial.dto';
import { ActualizarCredencialDto } from './dto/actualizar-credencial.dto';

@Injectable()
export class ServicioCredenciales {
  constructor(
    @InjectRepository(Credencial)
    private credencialRepository: Repository<Credencial>,
  ) {}

  async create(createDto: CrearCredencialDto): Promise<Credencial> {
    const existing = await this.credencialRepository.findOne({
      where: {
        student_id: createDto.student_id,
        gestion: createDto.gestion,
        semester: createDto.semester,
      },
    });

    if (existing) {
      throw new ConflictException(`Ya existe una credencial para este estudiante en la gestión ${createDto.gestion} semestre ${createDto.semester}`);
    }

    const credential = this.credencialRepository.create(createDto);
    return this.credencialRepository.save(credential);
  }

  async findAll(
    page = 1,
    limit = 20,
    gestion?: string,
    semester?: number,
    status?: EstadoCredencial,
  ): Promise<{ data: Credencial[]; total: number; page: number; limit: number }> {
    const query = this.credencialRepository
      .createQueryBuilder('credential')
      .leftJoinAndSelect('credential.estudiante', 'student')
      .leftJoinAndSelect('student.persona', 'person')
      .leftJoinAndSelect('student.carrera', 'career')
      .leftJoinAndSelect('credential.gestionEntity', 'gestion')
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
    const credential = await this.credencialRepository.findOne({
      where: { id },
      relations: ['estudiante', 'estudiante.persona', 'estudiante.carrera', 'gestionEntity', 'emisor'],
    });
    if (!credential) {
      throw new NotFoundException(`Credencial con ID ${id} no encontrada`);
    }
    return credential;
  }

  async update(id: number, updateDto: ActualizarCredencialDto): Promise<Credencial> {
    const credential = await this.findOne(id);
    Object.assign(credential, updateDto);
    return this.credencialRepository.save(credential);
  }

  async remove(id: number): Promise<void> {
    const credential = await this.findOne(id);
    await this.credencialRepository.remove(credential);
  }

  async findByStudent(studentId: number): Promise<Credencial[]> {
    return this.credencialRepository.find({
      where: { student_id: studentId },
      relations: ['emisor', 'estudiante'],
      order: { issued_date: 'DESC' },
    });
  }

  async findActiveByStudent(studentId: number): Promise<Credencial | null> {
    return this.credencialRepository.findOne({
      where: { student_id: studentId, status: EstadoCredencial.EMITIDA },
      relations: ['emisor'],
      order: { issued_date: 'DESC' },
    });
  }

  async findByStudentAndGestion(studentId: number, gestion: string): Promise<Credencial[]> {
    return this.credencialRepository.find({
      where: { student_id: studentId, gestion },
      relations: ['emisor', 'estudiante', 'estudiante.persona'],
      order: { semester: 'ASC' },
    });
  }

  async markAsPrinted(id: number): Promise<Credencial> {
    const credential = await this.findOne(id);
    credential.printed = true;
    return this.credencialRepository.save(credential);
  }

  async annul(id: number): Promise<Credencial> {
    const credential = await this.findOne(id);
    credential.status = EstadoCredencial.ANULADA;
    return this.credencialRepository.save(credential);
  }
}
