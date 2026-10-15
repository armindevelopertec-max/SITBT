import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Personal, EstadoPersonal, CargoPersonal } from '../../entidades/personal.entidad';
import { Persona } from '../../entidades/persona.entidad';
import { Usuario } from '../../entidades/usuario.entidad';
import { UsuarioRol } from '../../entidades/usuario-rol.entidad';
import { Rol } from '../../entidades/rol.entidad';
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
    private repositorioPersonal: Repository<Personal>,
    @InjectRepository(Persona)
    private repositorioPersona: Repository<Persona>,
    @InjectRepository(Usuario)
    private repositorioUsuario: Repository<Usuario>,
    @InjectRepository(UsuarioRol)
    private repositorioUsuarioRol: Repository<UsuarioRol>,
    @InjectRepository(Rol)
    private repositorioRol: Repository<Rol>,
  ) {}

  async crear(crearPersonalDto: CrearPersonalDto): Promise<PersonalCreadoConUsuario> {
    const personal = this.repositorioPersonal.create({
      ...crearPersonalDto,
      estado: crearPersonalDto.estado ?? EstadoPersonal.ACTIVO,
    });
    const personalGuardado = await this.repositorioPersonal.save(personal);

    const persona = await this.repositorioPersona.findOne({ where: { id: crearPersonalDto.personaId } });
    if (!persona) {
      throw new NotFoundException('Persona no encontrada');
    }
    const anioActual = new Date().getFullYear().toString();

    const nombreUsuario = `doc_${persona.ci.replace(/[^a-zA-Z0-9]/g, '')}`;
    const contrasena = `${persona.ci}-${anioActual}`;

    const contrasenaHash = await bcrypt.hash(contrasena, 10);
    const usuario = this.repositorioUsuario.create({
      personaId: personalGuardado.personaId,
      nombreUsuario: nombreUsuario,
      contrasenaHash: contrasenaHash,
      estado: 'activo' as any,
    });
    const usuarioGuardado = await this.repositorioUsuario.save(usuario);

    const codigoRol = this.mapearCargoARol(personalGuardado.cargo);
    const rol = await this.repositorioRol.findOne({ where: { codigo: codigoRol } });
    if (rol) {
      const usuarioRol = this.repositorioUsuarioRol.create({
        usuarioId: usuarioGuardado.id,
        rolId: rol.id,
      });
      await this.repositorioUsuarioRol.save(usuarioRol);
    }

    return {
      personal: personalGuardado,
      usuario: {
        nombreUsuario: nombreUsuario,
        contrasena: contrasena,
      },
    };
  }

  private mapearCargoARol(cargo: CargoPersonal): string {
    const mapaCargoRol: Record<CargoPersonal, string> = {
      [CargoPersonal.DOCENTE]: 'docente',
      [CargoPersonal.SECRETARIA]: 'secretaria',
      [CargoPersonal.DIRECTOR_ACADEMICO]: 'director_academico',
      [CargoPersonal.RECTOR]: 'rector',
      [CargoPersonal.APOYO]: 'apoyo',
      [CargoPersonal.BIBLIOTECARIO]: 'apoyo',
    };
    return mapaCargoRol[cargo] || 'apoyo';
  }

  async obtenerTodos(
    pagina = 1,
    limite = 20,
    estado?: EstadoPersonal,
    cargo?: CargoPersonal,
  ): Promise<{ datos: Personal[]; total: number; pagina: number; limite: number }> {
    const consulta = this.repositorioPersonal
      .createQueryBuilder('personal')
      .leftJoinAndSelect('personal.persona', 'persona');

    if (estado) {
      consulta.andWhere('personal.estado = :estado', { estado });
    }

    if (cargo) {
      consulta.andWhere('personal.cargo = :cargo', { cargo });
    }

    const [datos, total] = await consulta
      .orderBy('personal.fechaContrato', 'DESC')
      .skip((pagina - 1) * limite)
      .take(limite)
      .getManyAndCount();

    return { datos, total, pagina, limite };
  }

  async obtenerUno(id: number): Promise<Personal> {
    const personal = await this.repositorioPersonal.findOne({
      where: { id },
      relations: ['persona'],
    });
    if (!personal) {
      throw new NotFoundException(`Personal con ID ${id} no encontrado`);
    }
    return personal;
  }

  async actualizar(id: number, actualizarPersonalDto: ActualizarPersonalDto): Promise<Personal> {
    const personal = await this.obtenerUno(id);
    Object.assign(personal, actualizarPersonalDto);
    return this.repositorioPersonal.save(personal);
  }

  async eliminar(id: number): Promise<void> {
    const personal = await this.obtenerUno(id);

    const usuario = await this.repositorioUsuario.findOne({
      where: { personaId: personal.personaId },
    });
    if (usuario) {
      await this.repositorioUsuarioRol.delete({ usuarioId: usuario.id });
      await this.repositorioUsuario.remove(usuario);
    }

    const personaId = personal.personaId;
    await this.repositorioPersonal.remove(personal);

    const persona = await this.repositorioPersona.findOne({ where: { id: personaId } });
    if (persona) {
      await this.repositorioPersona.remove(persona);
    }
  }

  async buscarPorCargo(cargo: CargoPersonal): Promise<Personal[]> {
    return this.repositorioPersonal.find({
      where: { cargo: cargo, estado: EstadoPersonal.ACTIVO },
      relations: ['persona'],
      order: { fechaContrato: 'ASC' },
    });
  }

  async obtenerActivos(): Promise<Personal[]> {
    return this.repositorioPersonal.find({
      where: { estado: EstadoPersonal.ACTIVO },
      relations: ['persona'],
      order: { fechaContrato: 'ASC' },
    });
  }

  async obtenerDocentes(): Promise<Personal[]> {
    return this.buscarPorCargo(CargoPersonal.DOCENTE);
  }
}
