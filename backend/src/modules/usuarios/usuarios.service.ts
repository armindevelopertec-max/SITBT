import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario, EstadoUsuario } from '../../entities/usuario.entity';
import { UsuarioRol } from '../../entities/usuario-rol.entity';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';

@Injectable()
export class ServicioUsuarios {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(UsuarioRol)
    private usuarioRolRepository: Repository<UsuarioRol>,
  ) {}

  async create(crearUsuarioDto: CrearUsuarioDto & { codigoRol?: string }): Promise<Usuario> {
    const contrasenaHash = await bcrypt.hash(crearUsuarioDto.password, 10);
    const usuario = this.usuarioRepository.create({
      ...crearUsuarioDto,
      contrasenaHash: contrasenaHash,
    });
    const usuarioGuardado = await this.usuarioRepository.save(usuario);

    if (crearUsuarioDto.codigoRol) {
      const rolRepository = this.usuarioRolRepository.manager.getRepository('Rol');
      const rol = await rolRepository.findOne({ where: { codigo: crearUsuarioDto.codigoRol } });
      if (rol) {
        const usuarioRol = this.usuarioRolRepository.create({
          usuarioId: usuarioGuardado.id,
          rolId: rol.id,
        });
        await this.usuarioRolRepository.save(usuarioRol);
      }
    }

    return this.findOne(usuarioGuardado.id);
  }

  async findAll(
    page = 1,
    limit = 20,
    estado?: EstadoUsuario,
  ): Promise<{ data: Usuario[]; total: number; page: number; limit: number }> {
    const query = this.usuarioRepository
      .createQueryBuilder('usuario')
      .leftJoinAndSelect('usuario.persona', 'persona')
      .leftJoinAndSelect('usuario.usuarioRoles', 'usuarioRol')
      .leftJoinAndSelect('usuarioRol.rol', 'rol');

    if (estado) {
      query.andWhere('usuario.estado = :estado', { estado: estado });
    }

    const [data, total] = await query
      .orderBy('usuario.creadoEn', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const usuariosConRoles = data.map(usuario => ({
      ...usuario,
      roles: usuario.usuarioRoles?.map((ur: UsuarioRol) => ur.rol).filter(Boolean) || [],
    }));

    return { data: usuariosConRoles, total, page, limit };
  }

  async findOne(id: number): Promise<any> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: ['persona', 'usuarioRoles', 'usuarioRoles.rol'],
    });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return {
      ...usuario,
      roles: usuario.usuarioRoles?.map((ur: UsuarioRol) => ur.rol).filter(Boolean) || [],
    };
  }

  async findByNombreUsuario(nombreUsuario: string): Promise<any> {
    const usuario = await this.usuarioRepository.findOne({
      where: { nombreUsuario },
      relations: ['persona', 'usuarioRoles', 'usuarioRoles.rol'],
    });
    if (!usuario) {
      throw new NotFoundException(`Usuario ${nombreUsuario} no encontrado`);
    }
    return {
      ...usuario,
      roles: usuario.usuarioRoles?.map((ur: UsuarioRol) => ur.rol).filter(Boolean) || [],
    };
  }

  async update(id: number, actualizarUsuarioDto: ActualizarUsuarioDto): Promise<Usuario> {
    const usuario = await this.findOne(id);

    if (actualizarUsuarioDto.password) {
      actualizarUsuarioDto.password = await bcrypt.hash(actualizarUsuarioDto.password, 10);
      (usuario as any).contrasenaHash = actualizarUsuarioDto.password;
      delete (actualizarUsuarioDto as any).password;
    }

    Object.assign(usuario, actualizarUsuarioDto);
    return this.usuarioRepository.save(usuario as any) as any;
  }

  async remove(id: number): Promise<void> {
    const usuario = await this.findOne(id);
    usuario.estado = EstadoUsuario.INACTIVO;
    await this.usuarioRepository.save(usuario);
  }

  async cambiarContrasena(id: number, nuevaContrasena: string): Promise<void> {
    const usuario = await this.findOne(id);
    usuario.contrasenaHash = await bcrypt.hash(nuevaContrasena, 10);
    await this.usuarioRepository.save(usuario);
  }

  async asignarRol(usuarioId: number, rolId: number): Promise<UsuarioRol> {
    const existing = await this.usuarioRolRepository.findOne({
      where: { usuarioId: usuarioId, rolId: rolId },
    });

    if (existing) {
      return existing;
    }

    const usuarioRol = this.usuarioRolRepository.create({
      usuarioId: usuarioId,
      rolId: rolId,
    });
    return this.usuarioRolRepository.save(usuarioRol as any) as any;
  }

  async removerRol(usuarioId: number, rolId: number): Promise<void> {
    const usuarioRol = await this.usuarioRolRepository.findOne({
      where: { usuarioId: usuarioId, rolId: rolId },
    });
    if (usuarioRol) {
      await this.usuarioRolRepository.remove(usuarioRol);
    }
  }

  async obtenerRolesUsuario(usuarioId: number): Promise<UsuarioRol[]> {
    return this.usuarioRolRepository.find({
      where: { usuarioId: undefined },
      relations: ['rol'],
    });
  }

  async findActive(): Promise<any[]> {
    const usuarios = await this.usuarioRepository.find({
      where: { estado: EstadoUsuario.ACTIVO },
      relations: ['persona', 'usuarioRoles', 'usuarioRoles.rol'],
      order: { nombreUsuario: 'ASC' },
    });
    return usuarios.map(usuario => ({
      ...usuario,
      roles: usuario.usuarioRoles?.map((ur: UsuarioRol) => ur.rol).filter(Boolean) || [],
    }));
  }
}
