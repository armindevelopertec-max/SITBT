import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Persona, EstadoPersona } from '../../entities/persona.entity';
import { CrearPersonaDto } from './dto/crear-persona.dto';
import { ActualizarPersonaDto } from './dto/actualizar-persona.dto';

@Injectable()
export class ServicioPersonas {
  constructor(
    @InjectRepository(Persona)
    private personaRepository: Repository<Persona>,
  ) {}

  async create(crearPersonaDto: CrearPersonaDto): Promise<Persona> {
    const existingCi = await this.personaRepository.findOne({
      where: { ci: crearPersonaDto.ci },
    });
    if (existingCi) {
      throw new ConflictException('Ya existe una persona con este CI');
    }

    const person = this.personaRepository.create(crearPersonaDto);
    return this.personaRepository.save(person);
  }

  async findAll(
    page = 1,
    limit = 20,
    status?: EstadoPersona,
  ): Promise<{ data: Persona[]; total: number; page: number; limit: number }> {
    const query = this.personaRepository.createQueryBuilder('person');

    if (status) {
      query.where('person.estado = :status', { estado: status });
    }

    const [data, total] = await query
      .orderBy('person.apellidoPaterno', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Persona> {
    const person = await this.personaRepository.findOne({ where: { id } });
    if (!person) {
      throw new NotFoundException(`Persona con ID ${id} no encontrada`);
    }
    return person;
  }

  async findByCi(ci: string): Promise<Persona> {
    const person = await this.personaRepository.findOne({ where: { ci } });
    if (!person) {
      throw new NotFoundException(`Persona con CI ${ci} no encontrada`);
    }
    return person;
  }

  async update(id: number, actualizarPersonaDto: ActualizarPersonaDto): Promise<Persona> {
    const person = await this.findOne(id);
    Object.assign(person, actualizarPersonaDto);
    return this.personaRepository.save(person);
  }

  async remove(id: number): Promise<void> {
    const person = await this.findOne(id);
    await this.personaRepository.remove(person);
  }

  async search(query: string, page = 1, limit = 20): Promise<{ data: Persona[]; total: number }> {
    const [data, total] = await this.personaRepository
      .createQueryBuilder('person')
      .where('person.names ILIKE :query', { query: `%${query}%` })
      .orWhere('person.apellidoPaterno ILIKE :query', { query: `%${query}%` })
      .orWhere('person.apellidoMaterno ILIKE :query', { query: `%${query}%` })
      .orWhere('person.ci ILIKE :query', { query: `%${query}%` })
      .orderBy('person.apellidoPaterno', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findActive(): Promise<Persona[]> {
    return this.personaRepository.find({
      where: { estado: EstadoPersona.ACTIVO },
      order: { apellidoPaterno: 'ASC' },
    });
  }
}