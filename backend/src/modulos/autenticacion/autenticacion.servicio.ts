import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../../entidades/usuario.entidad';
import { Persona } from '../../entidades/persona.entidad';
import { UsuarioRol } from '../../entidades/usuario-rol.entidad';
import { EstadoRol, Rol } from '../../entidades/rol.entidad';
import { EstadoPermiso, Permiso } from '../../entidades/permiso.entidad';

@Injectable()
export class AutenticacionServicio {
  constructor(
    @InjectRepository(Usuario)
    private repositorioUsuario: Repository<Usuario>,
    @InjectRepository(Persona)
    private repositorioPersona: Repository<Persona>,
    @InjectRepository(UsuarioRol)
    private repositorioUsuarioRol: Repository<UsuarioRol>,
    @InjectRepository(Rol)
    private repositorioRol: Repository<Rol>,
    @InjectRepository(Permiso)
    private repositorioPermiso: Repository<Permiso>,
    private servicioJwt: JwtService,
  ) {}

  async registrar(datos: {
    nombreUsuario: string;
    contrasena: string;
    personaId: number;
  }) {
    const usuarioExistente = await (this.repositorioUsuario.findOne as any)({
      where: { nombreUsuario: datos.nombreUsuario } as any,
    });

    if (usuarioExistente) {
      throw new ConflictException('El nombre de usuario ya existe');
    }

    const hashContrasena = await bcrypt.hash(datos.contrasena, 10);

    const usuario = this.repositorioUsuario.create({
      nombreUsuario: datos.nombreUsuario,
      contrasenaHash: hashContrasena,
      personaId: datos.personaId,
    } as any);

    await this.repositorioUsuario.save(usuario);

    const rolPredeterminado = await this.repositorioRol.findOne({
      where: { codigo: 'estudiante' },
    });

    if (rolPredeterminado) {
      const usuarioRol = this.repositorioUsuarioRol.create({
        usuarioId: (usuario as any).id,
        rolId: rolPredeterminado.id,
      });
      await this.repositorioUsuarioRol.save(usuarioRol);
    }

    return { mensaje: 'Usuario registrado exitosamente', usuarioId: (usuario as any).id };
  }

  async iniciarSesion(nombreUsuario: string, contrasena: string) {
    if (!nombreUsuario || !contrasena) {
      throw new BadRequestException('El nombre de usuario y la contraseña son obligatorios');
    }

    const usuario = await (this.repositorioUsuario.findOne as any)({
      where: { nombreUsuario: nombreUsuario },
      relations: ['persona'],
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasenaHash);

    if (!contrasenaValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (usuario.estado !== 'activo') {
      throw new UnauthorizedException('Usuario inactivo o bloqueado');
    }

    usuario.ultimoAcceso = new Date();
    await this.repositorioUsuario.save(usuario);

    const rolesAsignados = await this.repositorioUsuarioRol.find({
      where: { usuarioId: usuario.id },
      relations: ['rol'],
    });

    const roles = rolesAsignados.filter(
      (usuarioRol) => usuarioRol.rol?.estado === EstadoRol.ACTIVO,
    );

    const permisos = await this.obtenerPermisosDeRoles(
      roles.map((usuarioRol) => usuarioRol.rol.id),
    );

    const cargaUtil = {
      usuarioId: usuario.id,
      nombreUsuario: usuario.nombreUsuario as any,
      personaId: usuario.personaId,
      roles: roles.map((usuarioRol) => usuarioRol.rol.codigo),
    };

    return {
      tokenAcceso: this.servicioJwt.sign(cargaUtil),
      usuario: {
        id: usuario.id,
        nombreUsuario: usuario.nombreUsuario as any,
        personaId: usuario.personaId,
        persona: usuario.persona,
        estado: usuario.estado,
        roles: roles.map((usuarioRol) => usuarioRol.rol),
        permisos,
      },
    };
  }

  async obtenerPerfil(usuarioId: number) {
    const usuario = await (this.repositorioUsuario.findOne as any)({
      where: { id: usuarioId },
      relations: ['persona'],
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const rolesAsignados = await this.repositorioUsuarioRol.find({
      where: { usuarioId: usuario.id },
      relations: ['rol'],
    });

    const roles = rolesAsignados.filter(
      (usuarioRol) => usuarioRol.rol?.estado === EstadoRol.ACTIVO,
    );

    const permisos = await this.obtenerPermisosDeRoles(
      roles.map((usuarioRol) => usuarioRol.rol.id),
    );

    return {
      id: usuario.id,
      nombreUsuario: usuario.nombreUsuario as any,
      personaId: usuario.personaId,
      persona: usuario.persona,
      estado: usuario.estado,
      roles: roles.map((usuarioRol) => usuarioRol.rol),
      permisos,
    };
  }

  private async obtenerPermisosDeRoles(rolIds: number[]): Promise<string[]> {
    if (rolIds.length === 0) {
      return [];
    }

    const permisos = await this.repositorioPermiso.find({
      where: {
        rolId: In(rolIds),
        estado: EstadoPermiso.ACTIVO,
      },
    });

    return [
      ...new Set(permisos.map((permiso) => `${permiso.modulo}:${permiso.accion}`)),
    ];
  }

  async validarUsuario(usuarioId: number): Promise<Usuario> {
    const usuario = await (this.repositorioUsuario.findOne as any)({
      where: { id: usuarioId },
    });
    if (!usuario || usuario.estado !== 'activo') {
      throw new UnauthorizedException('Usuario no válido');
    }
    return usuario;
  }
}
