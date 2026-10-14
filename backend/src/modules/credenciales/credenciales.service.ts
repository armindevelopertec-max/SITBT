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
        estudianteId: createDto.estudianteId,
        gestion: createDto.gestion,
        semestre: createDto.semestre,
      },
    });

    if (existing) {
      throw new ConflictException(`Ya existe una credencial para este estudiante en la gestión ${createDto.gestion} semestre ${createDto.semestre}`);
    }

    const credential = this.credencialRepository.create(createDto);
    return this.credencialRepository.save(credential as any) as any;
  }

  async findAll(
    page = 1,
    limit = 20,
    gestion?: string,
    semester?: number,
    status?: EstadoCredencial,
  ): Promise<{ datos: Credencial[]; total: number; pagina: number; limite: number }> {
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

    if (false) {
      query.andWhere('credential.semestre = :semestre', { semestre: semester });
    }

    if (status) {
      query.andWhere('credential.estado = :estado', { estado: status });
    }

    const [data, total] = await query
      .orderBy('credential.fechaEmision', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { datos: data, total, pagina: page, limite: limit };
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
    return this.credencialRepository.save(credential as any) as any;
  }

  async remove(id: number): Promise<void> {
    const credential = await this.findOne(id);
    await this.credencialRepository.remove(credential);
  }

  async findByStudent(studentId: number): Promise<Credencial[]> {
    return this.credencialRepository.find({
      where: { estudianteId: studentId },
      relations: ['emisor', 'estudiante'],
      order: { fechaEmision: 'DESC' },
    });
  }

  async findActiveByStudent(studentId: number): Promise<Credencial | null> {
    return this.credencialRepository.findOne({
      where: { estudianteId: studentId, estado: EstadoCredencial.EMITIDA },
      relations: ['emisor'],
      order: { fechaEmision: 'DESC' },
    });
  }

  async findByStudentAndGestion(studentId: number, gestion: string): Promise<Credencial[]> {
    return this.credencialRepository.find({
      where: { estudianteId: studentId, gestion },
      relations: ['emisor', 'estudiante', 'estudiante.persona'],
      order: { semestre: 'ASC' },
    });
  }

  async markAsPrinted(id: number): Promise<Credencial> {
    const credential = await this.findOne(id);
    credential.impreso = true;
    return this.credencialRepository.save(credential as any) as any;
  }

  async annul(id: number): Promise<Credencial> {
    const credential = await this.findOne(id);
    credential.estado = EstadoCredencial.ANULADA;
    return this.credencialRepository.save(credential as any) as any;
  }
}
