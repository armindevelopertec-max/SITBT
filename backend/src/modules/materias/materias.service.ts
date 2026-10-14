import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Materia } from '../../entities/materia.entity';
import { CrearMateriaDto } from './dto/crear-materia.dto';
import { ActualizarMateriaDto } from './dto/actualizar-materia.dto';

@Injectable()
export class ServicioMaterias {
  constructor(
    @InjectRepository(Materia)
    private materiaRepository: Repository<Materia>,
  ) {}

  async create(crearMateriaDto: CrearMateriaDto): Promise<Materia> {
    const existing = await this.materiaRepository.findOne({
      where: { codigo: crearMateriaDto.codigo },
    });
    if (existing) {
      throw new ConflictException(`Materia con código ${crearMateriaDto.codigo} ya existe`);
    }
    const subject = this.materiaRepository.create(crearMateriaDto);
    return this.materiaRepository.save(subject);
  }

  async findAll(
    page = 1,
    limit = 20,
  ): Promise<{ datos: Materia[]; total: number; pagina: number; limite: number }> {
    const [data, total] = await this.materiaRepository
      .createQueryBuilder('subject')
      .orderBy('subject.nombre', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { datos: data, total, pagina: page, limite: limit };
  }

  async findAllSubjects(): Promise<Materia[]> {
    return this.materiaRepository.find({
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Materia> {
    const subject = await this.materiaRepository.findOne({ where: { id } });
    if (!subject) {
      throw new NotFoundException(`Materia con ID ${id} no encontrada`);
    }
    return subject;
  }

  async findByCodigo(codigo: string): Promise<Materia> {
    const materia = await this.materiaRepository.findOne({ where: { codigo: undefined } });
    if (!materia) {
      throw new NotFoundException(`Materia con código ${codigo} no encontrada`);
    }
    return materia;
  }

  async update(id: number, actualizarMateriaDto: ActualizarMateriaDto): Promise<Materia> {
    const subject = await this.findOne(id);
    Object.assign(subject, actualizarMateriaDto);
    return this.materiaRepository.save(subject);
  }

  async remove(id: number): Promise<void> {
    const subject = await this.findOne(id);
    await this.materiaRepository.remove(subject);
  }

  async search(query: string): Promise<Materia[]> {
    return this.materiaRepository
      .createQueryBuilder('subject')
      .where('subject.nombre ILIKE :query', { query: `%${query}%` })
      .orWhere('subject.codigo ILIKE :query', { query: `%${query}%` })
      .orderBy('subject.nombre', 'ASC')
      .getMany();
  }
}