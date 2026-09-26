import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Materia } from '../../entities/materia.entity';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Materia)
    private subjectRepository: Repository<Materia>,
  ) {}

  async create(createSubjectDto: CreateSubjectDto): Promise<Materia> {
    const existing = await this.subjectRepository.findOne({
      where: { code: createSubjectDto.code },
    });
    if (existing) {
      throw new ConflictException(`Subject with code ${createSubjectDto.code} already exists`);
    }
    const subject = this.subjectRepository.create(createSubjectDto);
    return this.subjectRepository.save(subject);
  }

  async findAll(
    page = 1,
    limit = 20,
  ): Promise<{ data: Materia[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.subjectRepository
      .createQueryBuilder('subject')
      .orderBy('subject.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findAllSubjects(): Promise<Materia[]> {
    return this.subjectRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Materia> {
    const subject = await this.subjectRepository.findOne({ where: { id } });
    if (!subject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }
    return subject;
  }

  async findByCode(code: string): Promise<Materia> {
    const subject = await this.subjectRepository.findOne({ where: { code } });
    if (!subject) {
      throw new NotFoundException(`Subject with code ${code} not found`);
    }
    return subject;
  }

  async update(id: number, updateSubjectDto: UpdateSubjectDto): Promise<Materia> {
    const subject = await this.findOne(id);
    Object.assign(subject, updateSubjectDto);
    return this.subjectRepository.save(subject);
  }

  async remove(id: number): Promise<void> {
    const subject = await this.findOne(id);
    await this.subjectRepository.remove(subject);
  }

  async search(query: string): Promise<Materia[]> {
    return this.subjectRepository
      .createQueryBuilder('subject')
      .where('subject.name ILIKE :query', { query: `%${query}%` })
      .orWhere('subject.code ILIKE :query', { query: `%${query}%` })
      .orderBy('subject.name', 'ASC')
      .getMany();
  }
}