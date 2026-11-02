import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Personal, EstadoPersonal } from '../../entidades/personal.entidad';
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

/** Roles del sistema que no se ofrecen como cargo de personal. */
const ROLES_EXCLUIDOS_COMO_CARGO = new Set(['administrador', 'estudiante']);

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
    // El cargo ES el código de un rol activo: una sola fuente de verdad.
    // Se valida antes de crear nada para no dejar personal sin rol.
    const rol = await this.repositorioRol.findOne({
      where: { codigo: crearPersonalDto.cargo, estado: 'activo' as any },
    });
    if (!rol) {
      throw new BadRequestException(
        `El cargo "${crearPersonalDto.cargo}" no corresponde a ningún rol activo. ` +
          'Crea el rol desde /roles y vuelve a intentarlo.',
      );
    }

    const personal = this.repositorioPersonal.create({
      ...crearPersonalDto,
      cargo: rol.codigo,
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

    // El rol del cargo es el que se asigna al usuario.
    const usuarioRol = this.repositorioUsuarioRol.create({
      usuarioId: usuarioGuardado.id,
      rolId: rol.id,
    });
    await this.repositorioUsuarioRol.save(usuarioRol);

    return {
      personal: personalGuardado,
      usuario: {
        nombreUsuario: nombreUsuario,
        contrasena: contrasena,
      },
    };
  }

  private async buscarRolActivoPorCodigo(codigo: string): Promise<Rol | null> {
    return this.repositorioRol.findOne({
      where: { codigo, estado: 'activo' as any },
    });
  }

  async obtenerTodos(
    pagina = 1,
    limite = 20,
    estado?: EstadoPersonal,
    cargo?: string,
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

  /**
   * Roles que pueden usarse como cargo de personal.
   *
   * El cargo del personal ES el código de un rol, por eso la lista se arma
   * desde la tabla `roles`. Se excluyen los roles del sistema que no son
   * cargos de personal: `administrador` y `estudiante`.
   */
  async obtenerCargosDisponibles(): Promise<
    Array<{ codigo: string; nombre: string; descripcion: string | null }>
  > {
    const roles = await this.repositorioRol.find({
      where: { estado: 'activo' as any },
      order: { nombre: 'ASC' },
    });

    return roles
      .filter((rol) => !ROLES_EXCLUIDOS_COMO_CARGO.has(rol.codigo))
      .map((rol) => ({
        codigo: rol.codigo,
        nombre: rol.nombre,
        descripcion: rol.descripcion ?? null,
      }));
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
    const cargoAnterior = personal.cargo;

    // Si cambia el cargo, el nuevo cargo debe ser un rol activo existente.
    let rolNuevo: Rol | null = null;
    if (actualizarPersonalDto.cargo && actualizarPersonalDto.cargo !== cargoAnterior) {
      rolNuevo = await this.buscarRolActivoPorCodigo(actualizarPersonalDto.cargo);
      if (!rolNuevo) {
        throw new BadRequestException(
          `El cargo "${actualizarPersonalDto.cargo}" no corresponde a ningún rol activo. ` +
            'Crea el rol desde /roles y vuelve a intentarlo.',
        );
      }
    }

    Object.assign(personal, actualizarPersonalDto);
    const personalGuardado = await this.repositorioPersonal.save(personal);

    // Se sincroniza el rol del usuario con el cargo del personal:
    // el rol del cargo anterior se retira y se asigna el nuevo.
    if (rolNuevo) {
      const usuario = await this.repositorioUsuario.findOne({
        where: { personaId: personalGuardado.personaId },
      });
      if (usuario) {
        const rolAnterior = await this.repositorioRol.findOne({
          where: { codigo: cargoAnterior },
        });

        if (rolAnterior) {
          await this.repositorioUsuarioRol.delete({
            usuarioId: usuario.id,
            rolId: rolAnterior.id,
          });
        }

        const yaTieneRol = await this.repositorioUsuarioRol.findOne({
          where: { usuarioId: usuario.id, rolId: rolNuevo.id },
        });
        if (!yaTieneRol) {
          await this.repositorioUsuarioRol.save(
            this.repositorioUsuarioRol.create({
              usuarioId: usuario.id,
              rolId: rolNuevo.id,
            }),
          );
        }
      }
    }

    return personalGuardado;
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

  async buscarPorCargo(cargo: string): Promise<Personal[]> {
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
    return this.buscarPorCargo('docente');
  }
}
