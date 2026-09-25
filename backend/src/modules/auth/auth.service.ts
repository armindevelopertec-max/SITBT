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
export class AuthService {
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
    username: string;
    password: string;
    person_id: number;
  }) {
    const existingUser = await this.userRepository.findOne({
      where: { username: data.username },
    });

    if (existingUser) {
      throw new ConflictException('El nombre de usuario ya existe');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = this.userRepository.create({
      username: data.username,
      password_hash: passwordHash,
      person_id: data.person_id,
    });

    await this.userRepository.save(user);

    const defaultRole = await this.roleRepository.findOne({
      where: { code: 'estudiante' },
    });

    if (defaultRole) {
      const userRole = this.userRoleRepository.create({
        user_id: user.id,
        role_id: defaultRole.id,
      });
      await this.userRoleRepository.save(userRole);
    }

    return { message: 'Usuario registrado exitosamente', user_id: user.id };
  }

  async login(username: string, password: string) {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: ['persona'],
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (user.status !== 'activo') {
      throw new UnauthorizedException('Usuario inactivo o bloqueado');
    }

    user.last_login = new Date();
    await this.userRepository.save(user);

    const roles = await this.userRoleRepository.find({
      where: { user_id: user.id },
      relations: ['rol'],
    });

    const payload = {
      sub: user.id,
      username: user.username,
      person_id: user.person_id,
      roles: roles.map((ur) => ur.rol.code),
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        person_id: user.person_id,
        persona: user.persona,
        roles: roles.map((ur) => ur.rol),
      },
    };
  }

  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['persona'],
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const roles = await this.userRoleRepository.find({
      where: { user_id: user.id },
      relations: ['rol'],
    });

    return {
      id: user.id,
      username: user.username,
      person_id: user.person_id,
      persona: user.persona,
      roles: roles.map((ur) => ur.rol),
    };
  }

  async validateUser(userId: number): Promise<Usuario> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user || user.status !== 'activo') {
      throw new UnauthorizedException('Usuario no válido');
    }
    return user;
  }
}
