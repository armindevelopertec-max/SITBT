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
    private repositorioRol: Repository<Rol>,
  ) {}

  async crear(crearRolDto: CrearRolDto): Promise<Rol> {
    const existente = await this.repositorioRol.findOne({
      where: { codigo: crearRolDto.codigo },
    });
    if (existente) {
      throw new ConflictException(`Rol con código ${crearRolDto.codigo} ya existe`);
    }
    const rol = this.repositorioRol.create({
      codigo: crearRolDto.codigo,
      nombre: crearRolDto.nombre,
      descripcion: crearRolDto.descripcion,
      estado: crearRolDto.estado,
    });
    return this.repositorioRol.save(rol);
  }

  async obtenerTodos(
    pagina = 1,
    limite = 20,
    estado?: EstadoRol,
  ): Promise<{ datos: Rol[]; total: number; pagina: number; limite: number }> {
    const consulta = this.repositorioRol.createQueryBuilder('rol');

    if (estado) {
      consulta.where('rol.estado = :estado', { estado: estado });
    }

    const [datos, total] = await consulta
      .orderBy('rol.nombre', 'ASC')
      .skip((pagina - 1) * limite)
      .take(limite)
      .getManyAndCount();

    return { datos, total, pagina, limite };
  }

  async obtenerUno(id: number): Promise<Rol> {
    const rol = await this.repositorioRol.findOne({ where: { id } });
    if (!rol) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }
    return rol;
  }

  async buscarPorCodigo(codigo: string): Promise<Rol> {
    const rol = await this.repositorioRol.findOne({ where: { codigo } });
    if (!rol) {
      throw new NotFoundException(`Rol con código ${codigo} no encontrado`);
    }
    return rol;
  }

  async actualizar(id: number, actualizarRolDto: ActualizarRolDto): Promise<Rol> {
    const rol = await this.obtenerUno(id);
    Object.assign(rol, actualizarRolDto);
    return this.repositorioRol.save(rol);
  }

  async eliminar(id: number): Promise<void> {
    const rol = await this.obtenerUno(id);
    await this.repositorioRol.remove(rol);
  }

  async obtenerActivos(): Promise<Rol[]> {
    return this.repositorioRol.find({
      where: { estado: EstadoRol.ACTIVO },
      order: { nombre: 'ASC' },
    });
  }
}
