import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Turno } from '../../entities/turno.entity';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';

@Injectable()
export class ShiftsService {
  constructor(
    @InjectRepository(Turno)
    private shiftRepository: Repository<Turno>,
  ) {}

  async create(createShiftDto: CreateShiftDto): Promise<Turno> {
    const existing = await this.shiftRepository.findOne({
      where: { code: createShiftDto.code },
    });
    if (existing) {
      throw new ConflictException(`Shift with code ${createShiftDto.code} already exists`);
    }
    const shift = this.shiftRepository.create(createShiftDto);
    return this.shiftRepository.save(shift);
  }

  async findAll(
    page = 1,
    limit = 20,
  ): Promise<{ data: Turno[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.shiftRepository
      .createQueryBuilder('shift')
      .orderBy('shift.start_time', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Turno> {
    const shift = await this.shiftRepository.findOne({ where: { id } });
    if (!shift) {
      throw new NotFoundException(`Shift with ID ${id} not found`);
    }
    return shift;
  }

  async findByCode(code: string): Promise<Turno> {
    const shift = await this.shiftRepository.findOne({ where: { code } });
    if (!shift) {
      throw new NotFoundException(`Shift with code ${code} not found`);
    }
    return shift;
  }

  async update(id: number, updateShiftDto: UpdateShiftDto): Promise<Turno> {
    const shift = await this.findOne(id);
    Object.assign(shift, updateShiftDto);
    return this.shiftRepository.save(shift);
  }

  async remove(id: number): Promise<void> {
    const shift = await this.findOne(id);
    await this.shiftRepository.remove(shift);
  }

  async findAllShifts(): Promise<Turno[]> {
    return this.shiftRepository.find({
      order: { start_time: 'ASC' },
    });
  }
}