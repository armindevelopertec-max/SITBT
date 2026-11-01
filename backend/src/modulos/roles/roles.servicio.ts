import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rol, EstadoRol } from '../../entidades/rol.entidad';
import { UsuarioRol } from '../../entidades/usuario-rol.entidad';
import { Permiso } from '../../entidades/permiso.entidad';
import { CrearRolDto } from './dto/crear-rol.dto';
import { ActualizarRolDto } from './dto/actualizar-rol.dto';

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
      estado: crearRolDto.estado ?? EstadoRol.ACTIVO,
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

    if (rol.codigo === 'administrador' && actualizarRolDto.estado === EstadoRol.INACTIVO) {
      throw new ConflictException('El rol administrador no se puede desactivar');
    }

    Object.assign(rol, actualizarRolDto);
    return this.repositorioRol.save(rol);
  }

  async eliminar(id: number): Promise<void> {
    const rol = await this.obtenerUno(id);

    if (rol.codigo === 'administrador') {
      throw new ConflictException('El rol administrador no se puede eliminar');
    }

    const asignaciones = await this.repositorioRol.manager
      .getRepository(UsuarioRol)
      .count({ where: { rolId: id } });

    if (asignaciones > 0) {
      throw new ConflictException(
        'No se puede eliminar un rol que está asignado a usuarios',
      );
    }

    await this.repositorioRol.manager
      .getRepository(Permiso)
      .delete({ rolId: id });

    await this.repositorioRol.remove(rol);
  }

  async obtenerActivos(): Promise<Rol[]> {
    return this.repositorioRol.find({
      where: { estado: EstadoRol.ACTIVO },
      order: { nombre: 'ASC' },
    });
  }
}
