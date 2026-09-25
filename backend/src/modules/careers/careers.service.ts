import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Carrera, CareerStatus } from '../../entities/carrera.entity';
import { CreateCareerDto } from './dto/create-career.dto';
import { UpdateCareerDto } from './dto/update-career.dto';

@Injectable()
export class CareersService {
  constructor(
    @InjectRepository(Carrera)
    private careerRepository: Repository<Carrera>,
  ) {}

  async create(createCareerDto: CreateCareerDto): Promise<Carrera> {
    const existing = await this.careerRepository.findOne({
      where: { code: createCareerDto.code },
    });
    if (existing) {
      throw new ConflictException(`Career with code ${createCareerDto.code} already exists`);
    }
    const career = this.careerRepository.create(createCareerDto);
    return this.careerRepository.save(career);
  }

  async findAll(
    page = 1,
    limit = 20,
    status?: CareerStatus,
  ): Promise<{ data: Carrera[]; total: number; page: number; limit: number }> {
    const query = this.careerRepository.createQueryBuilder('career');

    if (status) {
      query.where('career.status = :status', { status });
    }

    const [data, total] = await query
      .orderBy('career.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Carrera> {
    const career = await this.careerRepository.findOne({ where: { id } });
    if (!career) {
      throw new NotFoundException(`Career with ID ${id} not found`);
    }
    return career;
  }

  async findByCode(code: string): Promise<Carrera> {
    const career = await this.careerRepository.findOne({ where: { code } });
    if (!career) {
      throw new NotFoundException(`Career with code ${code} not found`);
    }
    return career;
  }

  async update(id: number, updateCareerDto: UpdateCareerDto): Promise<Carrera> {
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
      where: { status: CareerStatus.ACTIVO },
      order: { name: 'ASC' },
    });
  }

  async findByArea(area: string): Promise<Carrera[]> {
    return this.careerRepository.find({
      where: { area, status: CareerStatus.ACTIVO },
      order: { name: 'ASC' },
    });
  }
}