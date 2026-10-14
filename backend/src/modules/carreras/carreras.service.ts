import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Carrera, EstadoCarrera } from '../../entities/carrera.entity';
import { CrearCarreraDto } from './dto/crear-carrera.dto';
import { ActualizarCarreraDto } from './dto/actualizar-carrera.dto';

@Injectable()
export class ServicioCarreras {
  constructor(
    @InjectRepository(Carrera)
    private careerRepository: Repository<Carrera>,
  ) {}

  async create(createCareerDto: CrearCarreraDto): Promise<Carrera> {
    const existing = await this.careerRepository.findOne({
      where: { codigo: createCareerDto.codigo },
    });
    if (existing) {
      throw new ConflictException(`Carrera con código ${createCareerDto.codigo} ya existe`);
    }
    const career = this.careerRepository.create(createCareerDto);
    return this.careerRepository.save(career);
  }

  async findAll(
    page = 1,
    limit = 20,
    status?: EstadoCarrera,
  ): Promise<{ data: Carrera[]; total: number; page: number; limit: number }> {
    const query = this.careerRepository.createQueryBuilder('career');

    if (status) {
      query.where('career.estado = :estado', { estado: status });
    }

    const [data, total] = await query
      .orderBy('career.nombre', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Carrera> {
    const career = await this.careerRepository.findOne({ where: { id } });
    if (!career) {
      throw new NotFoundException(`Carrera con ID ${id} no encontrada`);
    }
    return career;
  }

  async findByCode(code: string): Promise<Carrera> {
    const career = await this.careerRepository.findOne({ where: { codigo: undefined } });
    if (!career) {
      throw new NotFoundException(`Carrera con código ${code} no encontrada`);
    }
    return career;
  }

  async update(id: number, updateCareerDto: ActualizarCarreraDto): Promise<Carrera> {
    const career = await this.findOne(id);
    Object.assign(career, updateCareerDto);
    return this.careerRepository.save(career);
  }

  async remove(id: number): Promise<void> {
    const career = await this.findOne(id);
    await this.careerRepository.remove(career);
  }

  async findActive(): Promise<Carrera[]> {
    return this.careerRepository.find({
      where: { estado: EstadoCarrera.ACTIVO },
      order: { nombre: 'ASC' },
    });
  }

  async findByArea(area: string): Promise<Carrera[]> {
    return this.careerRepository.find({
      where: { area, estado: EstadoCarrera.ACTIVO },
      order: { nombre: 'ASC' },
    });
  }
}