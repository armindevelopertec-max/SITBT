import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Persona, EstadoPersona } from '../../entidades/persona.entidad';
import { Usuario } from '../../entidades/usuario.entidad';
import { UsuarioRol } from '../../entidades/usuario-rol.entidad';
import { CrearPersonaDto } from './dto/crear-persona.dto';
import { ActualizarPersonaDto } from './dto/actualizar-persona.dto';

@Injectable()
export class ServicioPersonas {
  constructor(
    @InjectRepository(Persona)
    private repositorioPersona: Repository<Persona>,
  ) {}

  async crear(crearPersonaDto: CrearPersonaDto): Promise<Persona> {
    const ciExistente = await this.repositorioPersona.findOne({
      where: { ci: crearPersonaDto.ci },
    });
    if (ciExistente) {
      throw new ConflictException('Ya existe una persona con este CI');
    }

    const persona = this.repositorioPersona.create(crearPersonaDto);
    return this.repositorioPersona.save(persona);
  }

  async obtenerTodos(
    pagina = 1,
    limite = 20,
    estado?: EstadoPersona,
  ): Promise<{ datos: Persona[]; total: number; pagina: number; limite: number }> {
    const consulta = this.repositorioPersona.createQueryBuilder('persona');

    if (estado) {
      consulta.where('persona.estado = :estado', { estado });
    }

    const [datos, total] = await consulta
      .orderBy('persona.apellidoPaterno', 'ASC')
      .skip((pagina - 1) * limite)
      .take(limite)
      .getManyAndCount();

    return { datos, total, pagina, limite };
  }

  async obtenerUno(id: number): Promise<Persona> {
    const persona = await this.repositorioPersona.findOne({ where: { id } });
    if (!persona) {
      throw new NotFoundException(`Persona con ID ${id} no encontrada`);
    }
    return persona;
  }

  async buscarPorCi(ci: string): Promise<Persona> {
    const persona = await this.repositorioPersona.findOne({ where: { ci } });
    if (!persona) {
      throw new NotFoundException(`Persona con CI ${ci} no encontrada`);
    }
    return persona;
  }

  async actualizar(id: number, actualizarPersonaDto: ActualizarPersonaDto): Promise<Persona> {
    const persona = await this.obtenerUno(id);
    Object.assign(persona, actualizarPersonaDto);
    return this.repositorioPersona.save(persona);
  }

  async eliminar(id: number): Promise<void> {
    const persona = await this.obtenerUno(id);

    // Eliminar el usuario asociado (y sus asignaciones de rol) para evitar
    // violaciones de clave foránea al borrar la persona.
    const usuario = await this.repositorioPersona.manager.findOne(Usuario, {
      where: { personaId: id },
    });
    if (usuario) {
      await this.repositorioPersona.manager.delete(UsuarioRol, { usuarioId: usuario.id });
      await this.repositorioPersona.manager.remove(usuario);
    }

    await this.repositorioPersona.remove(persona);
  }

  async buscar(consulta: string, pagina = 1, limite = 20): Promise<{ datos: Persona[]; total: number }> {
    const [datos, total] = await this.repositorioPersona
      .createQueryBuilder('persona')
      .where('persona.nombres ILIKE :consulta', { consulta: `%${consulta}%` })
      .orWhere('persona.apellidoPaterno ILIKE :consulta', { consulta: `%${consulta}%` })
      .orWhere('persona.apellidoMaterno ILIKE :consulta', { consulta: `%${consulta}%` })
      .orWhere('persona.ci ILIKE :consulta', { consulta: `%${consulta}%` })
      .orderBy('persona.apellidoPaterno', 'ASC')
      .skip((pagina - 1) * limite)
      .take(limite)
      .getManyAndCount();

    return { datos, total };
  }

  async obtenerActivos(): Promise<Persona[]> {
    return this.repositorioPersona.find({
      where: { estado: EstadoPersona.ACTIVO },
      order: { apellidoPaterno: 'ASC' },
    });
  }
}
