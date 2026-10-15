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
  personal: Personal;
  usuario: {
    nombreUsuario: string;
    contrasena: string;
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
    const staff = this.staffRepository.create({
      ...createStaffDto,
      estado: createStaffDto.estado ?? EstadoPersonal.ACTIVO,
    });
    const savedStaff = await this.staffRepository.save(staff);

    const persona = await this.personaRepository.findOne({ where: { id: createStaffDto.personaId } });
    if (!persona) {
      throw new NotFoundException('Persona no encontrada');
    }
    const currentYear = new Date().getFullYear().toString();

    const username = `doc_${persona.ci.replace(/[^a-zA-Z0-9]/g, '')}`;
    const password = `${persona.ci}-${currentYear}`;

    const passwordHash = await bcrypt.hash(password, 10);
    const usuario = this.usuarioRepository.create({
      personaId: savedStaff.personaId,
      nombreUsuario: username,
      contrasenaHash: passwordHash,
      estado: 'activo' as any,
    });
    const savedUsuario = await this.usuarioRepository.save(usuario);

    const roleCode = this.mapPositionToRole(savedStaff.cargo);
    const rol = await this.rolRepository.findOne({ where: { codigo: roleCode } });
    if (rol) {
      const usuarioRol = this.usuarioRolRepository.create({
        usuarioId: savedUsuario.id,
        rolId: rol.id,
      });
      await this.usuarioRolRepository.save(usuarioRol);
    }

    return {
      personal: savedStaff,
      usuario: {
        nombreUsuario: username,
        contrasena: password,
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
    cargo?: CargoPersonal,
  ): Promise<{ datos: Personal[]; total: number; pagina: number; limite: number }> {
    const query = this.staffRepository
      .createQueryBuilder('staff')
      .leftJoinAndSelect('staff.persona', 'persona');

    if (status) {
      query.andWhere('staff.estado = :status', { status });
    }

    if (cargo) {
      query.andWhere('staff.cargo = :cargo', { cargo });
    }

    const [data, total] = await query
      .orderBy('staff.fechaContrato', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { datos: data, total, pagina: page, limite: limit };
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
      where: { personaId: staff.personaId },
    });
    if (usuario) {
      await this.usuarioRolRepository.delete({ usuarioId: usuario.id });
      await this.usuarioRepository.remove(usuario);
    }

    const personaId = staff.personaId;
    await this.staffRepository.remove(staff);

    const persona = await this.personaRepository.findOne({ where: { id: personaId } });
    if (persona) {
      await this.personaRepository.remove(persona);
    }
  }

  async findByPosition(position: CargoPersonal): Promise<Personal[]> {
    return this.staffRepository.find({
      where: { cargo: position, estado: EstadoPersonal.ACTIVO },
      relations: ['persona'],
      order: { fechaContrato: 'ASC' },
    });
  }

  async findActive(): Promise<Personal[]> {
    return this.staffRepository.find({
      where: { estado: EstadoPersonal.ACTIVO },
      relations: ['persona'],
      order: { fechaContrato: 'ASC' },
    });
  }

  async findTeachers(): Promise<Personal[]> {
    return this.findByPosition(CargoPersonal.DOCENTE);
  }
}