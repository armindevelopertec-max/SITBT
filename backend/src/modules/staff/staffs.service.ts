import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Personal, StaffStatus, StaffPosition } from '../../entities/personal.entity';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

@Injectable()
export class StaffsService {
  constructor(
    @InjectRepository(Personal)
    private staffRepository: Repository<Personal>,
  ) {}

  async create(createStaffDto: CreateStaffDto): Promise<Personal> {
    const staff = this.staffRepository.create(createStaffDto);
    return this.staffRepository.save(staff);
  }

  async findAll(
    page = 1,
    limit = 20,
    status?: StaffStatus,
    position?: StaffPosition,
  ): Promise<{ data: Personal[]; total: number; page: number; limit: number }> {
    const query = this.staffRepository
      .createQueryBuilder('staff')
      .leftJoinAndSelect('staff.person', 'person');

    if (status) {
      query.andWhere('staff.status = :status', { status });
    }

    if (position) {
      query.andWhere('staff.position = :position', { position });
    }

    const [data, total] = await query
      .orderBy('staff.hire_date', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Personal> {
    const staff = await this.staffRepository.findOne({
      where: { id },
      relations: ['person'],
    });
    if (!staff) {
      throw new NotFoundException(`Staff with ID ${id} not found`);
    }
    return staff;
  }

  async update(id: number, updateStaffDto: UpdateStaffDto): Promise<Personal> {
    const staff = await this.findOne(id);
    Object.assign(staff, updateStaffDto);
    return this.staffRepository.save(staff);
  }

  async remove(id: number): Promise<void> {
    const staff = await this.findOne(id);
    await this.staffRepository.remove(staff);
  }

  async findByPosition(position: StaffPosition): Promise<Personal[]> {
    return this.staffRepository.find({
      where: { position, status: StaffStatus.ACTIVO },
      relations: ['person'],
      order: { hire_date: 'ASC' },
    });
  }

  async findActive(): Promise<Personal[]> {
    return this.staffRepository.find({
      where: { status: StaffStatus.ACTIVO },
      relations: ['person'],
      order: { hire_date: 'ASC' },
    });
  }

  async findTeachers(): Promise<Personal[]> {
    return this.findByPosition(StaffPosition.DOCENTE);
  }
}