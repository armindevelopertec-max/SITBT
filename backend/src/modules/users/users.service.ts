import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario, UserStatus } from '../../entities/usuario.entity';
import { UsuarioRol } from '../../entities/usuario-rol.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Usuario)
    private userRepository: Repository<Usuario>,
    @InjectRepository(UsuarioRol)
    private userRoleRepository: Repository<UsuarioRol>,
  ) {}

  async create(createUserDto: CreateUserDto & { role_code?: string }): Promise<Usuario> {
    const passwordHash = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      ...createUserDto,
      password_hash: passwordHash,
    });
    const savedUser = await this.userRepository.save(user);

    if (createUserDto.role_code) {
      const roleRepository = this.userRoleRepository.manager.getRepository('Rol');
      const role = await roleRepository.findOne({ where: { code: createUserDto.role_code } });
      if (role) {
        const userRole = this.userRoleRepository.create({
          user_id: savedUser.id,
          role_id: role.id,
        });
        await this.userRoleRepository.save(userRole);
      }
    }

    return this.findOne(savedUser.id);
  }

  async findAll(
    page = 1,
    limit = 20,
    status?: UserStatus,
  ): Promise<{ data: Usuario[]; total: number; page: number; limit: number }> {
    const query = this.userRepository
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
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['persona', 'usuarioRoles', 'usuarioRoles.rol'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return {
      ...user,
      roles: user.usuarioRoles?.map((ur: UsuarioRol) => ur.rol).filter(Boolean) || [],
    };
  }

  async findByUsername(username: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: ['persona', 'usuarioRoles', 'usuarioRoles.rol'],
    });
    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }
    return {
      ...user,
      roles: user.usuarioRoles?.map((ur: UsuarioRol) => ur.rol).filter(Boolean) || [],
    };
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<Usuario> {
    const user = await this.findOne(id);

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
      (user as any).password_hash = updateUserDto.password;
      delete (updateUserDto as any).password;
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    user.status = UserStatus.INACTIVO;
    await this.userRepository.save(user);
  }

  async changePassword(id: number, newPassword: string): Promise<void> {
    const user = await this.findOne(id);
    user.password_hash = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);
  }

  async assignRole(userId: number, roleId: number): Promise<UsuarioRol> {
    const existing = await this.userRoleRepository.findOne({
      where: { user_id: userId, role_id: roleId },
    });

    if (existing) {
      return existing;
    }

    const userRole = this.userRoleRepository.create({
      user_id: userId,
      role_id: roleId,
    });
    return this.userRoleRepository.save(userRole);
  }

  async removeRole(userId: number, roleId: number): Promise<void> {
    const userRole = await this.userRoleRepository.findOne({
      where: { user_id: userId, role_id: roleId },
    });
    if (userRole) {
      await this.userRoleRepository.remove(userRole);
    }
  }

  async getUserRoles(userId: number): Promise<UsuarioRol[]> {
    return this.userRoleRepository.find({
      where: { user_id: userId },
      relations: ['rol'],
    });
  }

  async findActive(): Promise<any[]> {
    const users = await this.userRepository.find({
      where: { status: UserStatus.ACTIVO },
      relations: ['persona', 'usuarioRoles', 'usuarioRoles.rol'],
      order: { username: 'ASC' },
    });
    return users.map(user => ({
      ...user,
      roles: user.usuarioRoles?.map((ur: UsuarioRol) => ur.rol).filter(Boolean) || [],
    }));
  }
}