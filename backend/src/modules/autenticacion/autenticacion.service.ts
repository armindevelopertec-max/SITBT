import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../../entities/usuario.entity';
import { Persona } from '../../entities/persona.entity';
import { UsuarioRol } from '../../entities/usuario-rol.entity';
import { Rol } from '../../entities/rol.entity';

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

    const roles = await this.repositorioUsuarioRol.find({
      where: { usuarioId: usuario.id },
      relations: ['rol'],
    });

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
        roles: roles.map((usuarioRol) => usuarioRol.rol),
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

    const roles = await this.repositorioUsuarioRol.find({
      where: { usuarioId: usuario.id },
      relations: ['rol'],
    });

    return {
      id: usuario.id,
      nombreUsuario: usuario.nombreUsuario as any,
      personaId: usuario.personaId,
      persona: usuario.persona,
      roles: roles.map((usuarioRol) => usuarioRol.rol),
    };
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
