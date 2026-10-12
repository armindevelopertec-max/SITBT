import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rol, EstadoRol } from '../../entities/rol.entity';
import { CrearRolDto } from './dto/create-role.dto';
import { ActualizarRolDto } from './dto/update-role.dto';

@Injectable()
export class ServicioRoles {
  constructor(
    @InjectRepository(Rol)
    private rolRepository: Repository<Rol>,
  ) {}

  async create(crearRolDto: CrearRolDto): Promise<Rol> {
    const existing = await this.rolRepository.findOne({
      where: { code: crearRolDto.code },
    });
    if (existing) {
      throw new ConflictException(`Rol con código ${crearRolDto.code} ya existe`);
    }
    const role = this.rolRepository.create(crearRolDto);
    return this.rolRepository.save(role);
  }

  async findAll(
    page = 1,
    limit = 20,
    status?: EstadoRol,
  ): Promise<{ data: Rol[]; total: number; page: number; limit: number }> {
    const query = this.rolRepository.createQueryBuilder('role');

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
    const role = await this.rolRepository.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }
    return role;
  }

  async findByCode(code: string): Promise<Rol> {
    const role = await this.rolRepository.findOne({ where: { code } });
    if (!role) {
      throw new NotFoundException(`Rol con código ${code} no encontrado`);
    }
    return role;
  }

  async update(id: number, actualizarRolDto: ActualizarRolDto): Promise<Rol> {
    const role = await this.findOne(id);
    Object.assign(role, actualizarRolDto);
    return this.rolRepository.save(role);
  }

  async remove(id: number): Promise<void> {
    const role = await this.findOne(id);
    await this.rolRepository.remove(role);
  }

  async findActive(): Promise<Rol[]> {
    return this.rolRepository.find({
      where: { status: EstadoRol.ACTIVO },
      order: { name: 'ASC' },
    });
  }
}