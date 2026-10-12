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

  async create(crearUsuarioDto: CrearUsuarioDto & { role_code?: string }): Promise<Usuario> {
    const passwordHash = await bcrypt.hash(crearUsuarioDto.password, 10);
    const user = this.usuarioRepository.create({
      ...crearUsuarioDto,
      password_hash: passwordHash,
    });
    const savedUser = await this.usuarioRepository.save(user);

    if (crearUsuarioDto.role_code) {
      const roleRepository = this.usuarioRolRepository.manager.getRepository('Rol');
      const role = await roleRepository.findOne({ where: { code: crearUsuarioDto.role_code } });
      if (role) {
        const userRole = this.usuarioRolRepository.create({
          user_id: savedUser.id,
          role_id: role.id,
        });
        await this.usuarioRolRepository.save(userRole);
      }
    }

    return this.findOne(savedUser.id);
  }

  async findAll(
    page = 1,
    limit = 20,
    status?: EstadoUsuario,
  ): Promise<{ data: Usuario[]; total: number; page: number; limit: number }> {
    const query = this.usuarioRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.persona', 'persona')
      .leftJoinAndSelect('user.usuarioRoles', 'usuarioRol')
      .leftJoinAndSelect('usuarioRol.rol', 'rol');

    if (status) {
      query.andWhere('user.status = :status', { status });
    }

    const [data, total] = await query
      .orderBy('user.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const usersWithRoles = data.map(user => ({
      ...user,
      roles: user.usuarioRoles?.map((ur: UsuarioRol) => ur.rol).filter(Boolean) || [],
    }));

    return { data: usersWithRoles, total, page, limit };
  }

  async findOne(id: number): Promise<any> {
    const user = await this.usuarioRepository.findOne({
      where: { id },
      relations: ['persona', 'usuarioRoles', 'usuarioRoles.rol'],
    });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return {
      ...user,
      roles: user.usuarioRoles?.map((ur: UsuarioRol) => ur.rol).filter(Boolean) || [],
    };
  }

  async findByUsername(username: string): Promise<any> {
    const user = await this.usuarioRepository.findOne({
      where: { username },
      relations: ['persona', 'usuarioRoles', 'usuarioRoles.rol'],
    });
    if (!user) {
      throw new NotFoundException(`Usuario ${username} no encontrado`);
    }
    return {
      ...user,
      roles: user.usuarioRoles?.map((ur: UsuarioRol) => ur.rol).filter(Boolean) || [],
    };
  }

  async update(id: number, actualizarUsuarioDto: ActualizarUsuarioDto): Promise<Usuario> {
    const user = await this.findOne(id);

    if (actualizarUsuarioDto.password) {
      actualizarUsuarioDto.password = await bcrypt.hash(actualizarUsuarioDto.password, 10);
      (user as any).password_hash = actualizarUsuarioDto.password;
      delete (actualizarUsuarioDto as any).password;
    }

    Object.assign(user, actualizarUsuarioDto);
    return this.usuarioRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    user.status = EstadoUsuario.INACTIVO;
    await this.usuarioRepository.save(user);
  }

  async changePassword(id: number, newPassword: string): Promise<void> {
    const user = await this.findOne(id);
    user.password_hash = await bcrypt.hash(newPassword, 10);
    await this.usuarioRepository.save(user);
  }

  async assignRole(userId: number, roleId: number): Promise<UsuarioRol> {
    const existing = await this.usuarioRolRepository.findOne({
      where: { user_id: userId, role_id: roleId },
    });

    if (existing) {
      return existing;
    }

    const userRole = this.usuarioRolRepository.create({
      user_id: userId,
      role_id: roleId,
    });
    return this.usuarioRolRepository.save(userRole);
  }

  async removeRole(userId: number, roleId: number): Promise<void> {
    const userRole = await this.usuarioRolRepository.findOne({
      where: { user_id: userId, role_id: roleId },
    });
    if (userRole) {
      await this.usuarioRolRepository.remove(userRole);
    }
  }

  async getUserRoles(userId: number): Promise<UsuarioRol[]> {
    return this.usuarioRolRepository.find({
      where: { user_id: userId },
      relations: ['rol'],
    });
  }

  async findActive(): Promise<any[]> {
    const users = await this.usuarioRepository.find({
      where: { status: EstadoUsuario.ACTIVO },
      relations: ['persona', 'usuarioRoles', 'usuarioRoles.rol'],
      order: { username: 'ASC' },
    });
    return users.map(user => ({
      ...user,
      roles: user.usuarioRoles?.map((ur: UsuarioRol) => ur.rol).filter(Boolean) || [],
    }));
  }
}