import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Personal, EstadoPersonal, CargoPersonal } from '../../entities/personal.entity';
import { Persona } from '../../entities/persona.entity';
import { Usuario } from '../../entities/usuario.entity';
import { UsuarioRol } from '../../entities/usuario-rol.entity';
import { Rol } from '../../entities/rol.entity';
import { CrearPersonalDto } from './dto/crear-personal.dto';
import { ActualizarPersonalDto } from './dto/actualizar-personal.dto';

export interface PersonalCreadoConUsuario {
  staff: Personal;
  user: {
    username: string;
    password: string;
  };
}

@Injectable()
export class ServicioPersonal {
  constructor(
    @InjectRepository(Personal)
    private staffRepository: Repository<Personal>,
    @InjectRepository(Persona)
    private personaRepository: Repository<Persona>,
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(UsuarioRol)
    private usuarioRolRepository: Repository<UsuarioRol>,
    @InjectRepository(Rol)
    private rolRepository: Repository<Rol>,
  ) {}

  async create(createStaffDto: CrearPersonalDto): Promise<PersonalCreadoConUsuario> {
    const staff = this.staffRepository.create(createStaffDto);
    const savedStaff = await this.staffRepository.save(staff);

    const persona = await this.personaRepository.findOne({ where: { id: createStaffDto.person_id } });
    if (!persona) {
      throw new NotFoundException('Persona no encontrada');
    }
    const currentYear = new Date().getFullYear().toString();

    const username = `doc_${persona.ci.replace(/[^a-zA-Z0-9]/g, '')}`;
    const password = `${persona.ci}-${currentYear}`;

    const passwordHash = await bcrypt.hash(password, 10);
    const usuario = this.usuarioRepository.create({
      person_id: savedStaff.person_id,
      username,
      password_hash: passwordHash,
      status: 'activo' as any,
    });
    const savedUsuario = await this.usuarioRepository.save(usuario);

    const roleCode = this.mapPositionToRole(savedStaff.position);
    const rol = await this.rolRepository.findOne({ where: { code: roleCode } });
    if (rol) {
      const usuarioRol = this.usuarioRolRepository.create({
        user_id: savedUsuario.id,
        role_id: rol.id,
      });
      await this.usuarioRolRepository.save(usuarioRol);
    }

    return {
      staff: savedStaff,
      user: {
        username,
        password,
      },
    };
  }

  private mapPositionToRole(position: CargoPersonal): string {
    const positionRoleMap: Record<CargoPersonal, string> = {
      [CargoPersonal.DOCENTE]: 'docente',
      [CargoPersonal.SECRETARIA]: 'secretaria',
      [CargoPersonal.DIRECTOR_ACADEMICO]: 'director_academico',
      [CargoPersonal.RECTOR]: 'rector',
      [CargoPersonal.APOYO]: 'apoyo',
      [CargoPersonal.BIBLIOTECARIO]: 'apoyo',
    };
    return positionRoleMap[position] || 'apoyo';
  }

  async findAll(
    page = 1,
    limit = 20,
    status?: EstadoPersonal,
    position?: CargoPersonal,
  ): Promise<{ data: Personal[]; total: number; page: number; limit: number }> {
    const query = this.staffRepository
      .createQueryBuilder('staff')
      .leftJoinAndSelect('staff.persona', 'persona');

    if (status) {
      query.andWhere('staff.status = :status', { status });
    }

    if (position) {
      query.andWhere('staff.position = :position', { position });
    }

    const [data, total] = await query
      .orderBy('staff.hire_date', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Personal> {
    const staff = await this.staffRepository.findOne({
      where: { id },
      relations: ['persona'],
    });
    if (!staff) {
      throw new NotFoundException(`Personal con ID ${id} no encontrado`);
    }
    return staff;
  }

  async update(id: number, updateStaffDto: ActualizarPersonalDto): Promise<Personal> {
    const staff = await this.findOne(id);
    Object.assign(staff, updateStaffDto);
    return this.staffRepository.save(staff);
  }

  async remove(id: number): Promise<void> {
    const staff = await this.findOne(id);

    const usuario = await this.usuarioRepository.findOne({
      where: { person_id: staff.person_id },
    });
    if (usuario) {
      await this.usuarioRepository.remove(usuario);
    }

    const personaId = staff.person_id;
    await this.staffRepository.remove(staff);

    const persona = await this.personaRepository.findOne({ where: { id: personaId } });
    if (persona) {
      await this.personaRepository.remove(persona);
    }
  }

  async findByPosition(position: CargoPersonal): Promise<Personal[]> {
    return this.staffRepository.find({
      where: { position, status: EstadoPersonal.ACTIVO },
      relations: ['persona'],
      order: { hire_date: 'ASC' },
    });
  }

  async findActive(): Promise<Personal[]> {
    return this.staffRepository.find({
      where: { status: EstadoPersonal.ACTIVO },
      relations: ['persona'],
      order: { hire_date: 'ASC' },
    });
  }

  async findTeachers(): Promise<Personal[]> {
    return this.findByPosition(CargoPersonal.DOCENTE);
  }
}