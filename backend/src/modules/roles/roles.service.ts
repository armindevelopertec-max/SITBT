import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rol, RoleStatus } from '../../entities/rol.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Rol)
    private roleRepository: Repository<Rol>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Rol> {
    const existing = await this.roleRepository.findOne({
      where: { code: createRoleDto.code },
    });
    if (existing) {
      throw new ConflictException(`Role with code ${createRoleDto.code} already exists`);
    }
    const role = this.roleRepository.create(createRoleDto);
    return this.roleRepository.save(role);
  }

  async findAll(
    page = 1,
    limit = 20,
    status?: RoleStatus,
  ): Promise<{ data: Rol[]; total: number; page: number; limit: number }> {
    const query = this.roleRepository.createQueryBuilder('role');

    if (status) {
      query.where('role.status = :status', { status });
    }

    const [data, total] = await query
      .orderBy('role.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Rol> {
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }

  async findByCode(code: string): Promise<Rol> {
    const role = await this.roleRepository.findOne({ where: { code } });
    if (!role) {
      throw new NotFoundException(`Role with code ${code} not found`);
    }
    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Rol> {
    const role = await this.findOne(id);
    Object.assign(role, updateRoleDto);
    return this.roleRepository.save(role);
  }

  async remove(id: number): Promise<void> {
    const role = await this.findOne(id);
    await this.roleRepository.remove(role);
  }

  async findActive(): Promise<Rol[]> {
    return this.roleRepository.find({
      where: { status: RoleStatus.ACTIVO },
      order: { name: 'ASC' },
    });
  }
}