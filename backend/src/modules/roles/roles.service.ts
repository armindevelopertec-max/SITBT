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
      where: { codigo: crearRolDto.codigo },
    });
    if (existing) {
      throw new ConflictException(`Rol con código ${crearRolDto.codigo} ya existe`);
    }
    const rol = this.rolRepository.create({
      codigo: crearRolDto.codigo,
      nombre: crearRolDto.nombre,
      descripcion: crearRolDto.descripcion,
      estado: crearRolDto.estado,
    });
    return this.rolRepository.save(rol);
  }

  async findAll(
    page = 1,
    limit = 20,
    estado?: EstadoRol,
  ): Promise<{ data: Rol[]; total: number; page: number; limit: number }> {
    const query = this.rolRepository.createQueryBuilder('rol');

    if (estado) {
      query.where('rol.estado = :estado', { estado });
    }

    const [data, total] = await query
      .orderBy('rol.nombre', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Rol> {
    const rol = await this.rolRepository.findOne({ where: { id } });
    if (!rol) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }
    return rol;
  }

  async findByCodigo(codigo: string): Promise<Rol> {
    const rol = await this.rolRepository.findOne({ where: { codigo } });
    if (!rol) {
      throw new NotFoundException(`Rol con código ${codigo} no encontrado`);
    }
    return rol;
  }

  async update(id: number, actualizarRolDto: ActualizarRolDto): Promise<Rol> {
    const rol = await this.findOne(id);
    Object.assign(rol, actualizarRolDto);
    return this.rolRepository.save(rol);
  }

  async remove(id: number): Promise<void> {
    const rol = await this.findOne(id);
    await this.rolRepository.remove(rol);
  }

  async findActive(): Promise<Rol[]> {
    return this.rolRepository.find({
      where: { estado: EstadoRol.ACTIVO },
      order: { nombre: 'ASC' },
    });
  }
}