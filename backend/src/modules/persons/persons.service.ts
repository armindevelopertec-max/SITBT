import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Persona, PersonStatus } from '../../entities/persona.entity';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';

@Injectable()
export class PersonsService {
  constructor(
    @InjectRepository(Persona)
    private personRepository: Repository<Persona>,
  ) {}

  async create(createPersonDto: CreatePersonDto): Promise<Persona> {
    const existingCi = await this.personRepository.findOne({
      where: { ci: createPersonDto.ci },
    });
    if (existingCi) {
      throw new ConflictException('Ya existe una persona con este CI');
    }

    const person = this.personRepository.create(createPersonDto);
    return this.personRepository.save(person);
  }

  async findAll(
    page = 1,
    limit = 20,
    status?: PersonStatus,
  ): Promise<{ data: Persona[]; total: number; page: number; limit: number }> {
    const query = this.personRepository.createQueryBuilder('person');

    if (status) {
      query.where('person.status = :status', { status });
    }

    const [data, total] = await query
      .orderBy('person.lastname_paternal', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Persona> {
    const person = await this.personRepository.findOne({ where: { id } });
    if (!person) {
      throw new NotFoundException(`Person with ID ${id} not found`);
    }
    return person;
  }

  async findByCi(ci: string): Promise<Persona> {
    const person = await this.personRepository.findOne({ where: { ci } });
    if (!person) {
      throw new NotFoundException(`Person with CI ${ci} not found`);
    }
    return person;
  }

  async update(id: number, updatePersonDto: UpdatePersonDto): Promise<Persona> {
    const person = await this.findOne(id);
    Object.assign(person, updatePersonDto);
    return this.personRepository.save(person);
  }

  async remove(id: number): Promise<void> {
    const person = await this.findOne(id);
    await this.personRepository.remove(person);
  }

  async search(query: string, page = 1, limit = 20): Promise<{ data: Persona[]; total: number }> {
    const [data, total] = await this.personRepository
      .createQueryBuilder('person')
      .where('person.names ILIKE :query', { query: `%${query}%` })
      .orWhere('person.lastname_paternal ILIKE :query', { query: `%${query}%` })
      .orWhere('person.lastname_maternal ILIKE :query', { query: `%${query}%` })
      .orWhere('person.ci ILIKE :query', { query: `%${query}%` })
      .orderBy('person.lastname_paternal', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findActive(): Promise<Persona[]> {
    return this.personRepository.find({
      where: { status: PersonStatus.ACTIVO },
      order: { lastname_paternal: 'ASC' },
    });
  }
}