import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario, EstadoUsuario } from '../../entidades/usuario.entidad';
import { UsuarioRol } from '../../entidades/usuario-rol.entidad';
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

  async crear(crearUsuarioDto: CrearUsuarioDto & { codigoRol?: string }): Promise<Usuario> {
    const contrasenaHash = await bcrypt.hash(crearUsuarioDto.contrasena, 10);
    const usuario = this.usuarioRepository.create({
      ...crearUsuarioDto,
      contrasenaHash: contrasenaHash,
    });
    const usuarioGuardado = await this.usuarioRepository.save(usuario);

    if (crearUsuarioDto.codigoRol) {
      const repositorioRol = this.usuarioRolRepository.manager.getRepository('Rol');
      const rol = await repositorioRol.findOne({ where: { codigo: crearUsuarioDto.codigoRol } });
      if (rol) {
        const usuarioRol = this.usuarioRolRepository.create({
          usuarioId: usuarioGuardado.id,
          rolId: rol.id,
        });
        await this.usuarioRolRepository.save(usuarioRol);
      }
    }

    return this.obtenerUno(usuarioGuardado.id);
  }

  async obtenerTodos(
    pagina = 1,
    limite = 20,
    estado?: EstadoUsuario,
  ): Promise<{ datos: Usuario[]; total: number; pagina: number; limite: number }> {
    const consulta = this.usuarioRepository
      .createQueryBuilder('usuario')
      .leftJoinAndSelect('usuario.persona', 'persona')
      .leftJoinAndSelect('usuario.usuarioRoles', 'usuarioRol')
      .leftJoinAndSelect('usuarioRol.rol', 'rol');

    if (estado) {
      consulta.andWhere('usuario.estado = :estado', { estado: estado });
    }

    const [datos, total] = await consulta
      .orderBy('usuario.creadoEn', 'DESC')
      .skip((pagina - 1) * limite)
      .take(limite)
      .getManyAndCount();

    const usuariosConRoles = datos.map(({ contrasenaHash, usuarioRoles, ...usuario }) => ({
      ...usuario,
      roles: usuarioRoles?.map((ur: UsuarioRol) => ur.rol).filter(Boolean) || [],
    }));

    return { datos: usuariosConRoles as any, total, pagina, limite };
  }

  async obtenerUno(id: number): Promise<any> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: ['persona', 'usuarioRoles', 'usuarioRoles.rol'],
    });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    const { contrasenaHash, usuarioRoles, ...resto } = usuario;
    return {
      ...resto,
      roles: usuarioRoles?.map((ur: UsuarioRol) => ur.rol).filter(Boolean) || [],
    };
  }

  async buscarPorNombreUsuario(nombreUsuario: string): Promise<any> {
    const usuario = await this.usuarioRepository.findOne({
      where: { nombreUsuario },
      relations: ['persona', 'usuarioRoles', 'usuarioRoles.rol'],
    });
    if (!usuario) {
      throw new NotFoundException(`Usuario ${nombreUsuario} no encontrado`);
    }
    const { contrasenaHash, usuarioRoles, ...resto } = usuario;
    return {
      ...resto,
      roles: usuarioRoles?.map((ur: UsuarioRol) => ur.rol).filter(Boolean) || [],
    };
  }

  async actualizar(id: number, actualizarUsuarioDto: ActualizarUsuarioDto): Promise<Usuario> {
    const usuario = await this.obtenerUno(id);

    if (actualizarUsuarioDto.contrasena) {
      actualizarUsuarioDto.contrasena = await bcrypt.hash(actualizarUsuarioDto.contrasena, 10);
      (usuario as any).contrasenaHash = actualizarUsuarioDto.contrasena;
      delete (actualizarUsuarioDto as any).contrasena;
    }

    Object.assign(usuario, actualizarUsuarioDto);
    return this.usuarioRepository.save(usuario as any) as any;
  }

  async eliminar(id: number): Promise<void> {
    const usuario = await this.obtenerUno(id);
    usuario.estado = EstadoUsuario.INACTIVO;
    await this.usuarioRepository.save(usuario);
  }

  async cambiarContrasena(id: number, nuevaContrasena: string): Promise<void> {
    const usuario = await this.obtenerUno(id);
    usuario.contrasenaHash = await bcrypt.hash(nuevaContrasena, 10);
    await this.usuarioRepository.save(usuario);
  }

  async asignarRol(usuarioId: number, rolId: number): Promise<UsuarioRol> {
    const existente = await this.usuarioRolRepository.findOne({
      where: { usuarioId: usuarioId, rolId: rolId },
    });

    if (existente) {
      return existente;
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
      where: { usuarioId: usuarioId },
      relations: ['rol'],
    });
  }

  async obtenerActivos(): Promise<any[]> {
    const usuarios = await this.usuarioRepository.find({
      where: { estado: EstadoUsuario.ACTIVO },
      relations: ['persona', 'usuarioRoles', 'usuarioRoles.rol'],
      order: { nombreUsuario: 'ASC' },
    });
    return usuarios.map(({ contrasenaHash, usuarioRoles, ...usuario }) => ({
      ...usuario,
      roles: usuarioRoles?.map((ur: UsuarioRol) => ur.rol).filter(Boolean) || [],
    }));
  }
}
