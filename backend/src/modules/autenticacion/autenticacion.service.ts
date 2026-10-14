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
    private userRepository: Repository<Usuario>,
    @InjectRepository(Persona)
    private personRepository: Repository<Persona>,
    @InjectRepository(UsuarioRol)
    private userRoleRepository: Repository<UsuarioRol>,
    @InjectRepository(Rol)
    private roleRepository: Repository<Rol>,
    private jwtService: JwtService,
  ) {}

  async register(data: {
    nombreUsuario: string;
    contrasena: string;
    personaId: number;
  }) {
    const existingUser = await (this.userRepository.findOne as any)({
      where: { nombreUsuario: data.nombreUsuario } as any,
    });

    if (existingUser) {
      throw new ConflictException('El nombre de usuario ya existe');
    }

    const passwordHash = await bcrypt.hash(data.contrasena, 10);

    const user = this.userRepository.create({
      nombreUsuario: data.nombreUsuario,
      contrasenaHash: passwordHash,
      personaId: data.personaId,
    } as any);

    await this.userRepository.save(user);

    const defaultRole = await this.roleRepository.findOne({
      where: { codigo: 'estudiante' },
    });

    if (defaultRole) {
      const userRole = this.userRoleRepository.create({
        usuarioId: (user as any).id,
        rolId: defaultRole.id,
      });
      await this.userRoleRepository.save(userRole);
    }

    return { mensaje: 'Usuario registrado exitosamente', usuarioId: (user as any).id };
  }

  async login(nombreUsuario: string, contrasena: string) {
    const user = await (this.userRepository.findOne as any)({
      where: { nombreUsuario: nombreUsuario },
      relations: ['persona'],
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(contrasena, user.contrasenaHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (user.estado !== 'activo') {
      throw new UnauthorizedException('Usuario inactivo o bloqueado');
    }

    user.ultimoAcceso = new Date();
    await this.userRepository.save(user);

    const roles = await this.userRoleRepository.find({
      where: { usuarioId: user.id },
      relations: ['rol'],
    });

    const payload = {
      usuarioId: user.id,
      nombreUsuario: user.nombreUsuario as any,
      personaId: user.personaId,
      roles: roles.map((ur) => ur.rol.codigo),
    };

    return {
      tokenAcceso: this.jwtService.sign(payload),
      usuario: {
        id: user.id,
        nombreUsuario: user.nombreUsuario as any,
        personaId: user.personaId,
        persona: user.persona,
        roles: roles.map((ur) => ur.rol),
      },
    };
  }

  async getProfile(userId: number) {
    const user = await (this.userRepository.findOne as any)({
      where: { id: userId },
      relations: ['persona'],
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const roles = await this.userRoleRepository.find({
      where: { usuarioId: user.id },
      relations: ['rol'],
    });

    return {
      id: user.id,
      nombreUsuario: user.nombreUsuario as any,
      personaId: user.personaId,
      persona: user.persona,
      roles: roles.map((ur) => ur.rol),
    };
  }

  async validateUser(userId: number): Promise<Usuario> {
    const user = await (this.userRepository.findOne as any)({
      where: { id: userId },
    });
    if (!user || user.estado !== 'activo') {
      throw new UnauthorizedException('Usuario no válido');
    }
    return user;
  }
}
