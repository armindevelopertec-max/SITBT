import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Estudiante, EstadoEstudiante } from '../../entidades/estudiante.entidad';
import { Persona } from '../../entidades/persona.entidad';
import { Usuario } from '../../entidades/usuario.entidad';
import { UsuarioRol } from '../../entidades/usuario-rol.entidad';
import { Rol } from '../../entidades/rol.entidad';
import { Carrera } from '../../entidades/carrera.entidad';
import { ConfiguracionInstitucional } from '../../entidades/configuracion-institucional.entidad';
import { PlanEstudio } from '../../entidades/plan-estudio.entidad';
import { Credencial } from '../../entidades/credencial.entidad';
import { CrearEstudianteDto } from './dto/crear-estudiante.dto';
import { ActualizarEstudianteDto } from './dto/actualizar-estudiante.dto';

export interface EstudianteCreadoConUsuario {
  estudiante: Estudiante;
  usuario: {
    nombreUsuario: string;
    contrasena: string;
  };
}

@Injectable()
export class ServicioEstudiantes {
  constructor(
    @InjectRepository(Estudiante)
    private repositorioEstudiante: Repository<Estudiante>,
    @InjectRepository(Persona)
    private repositorioPersona: Repository<Persona>,
    @InjectRepository(Usuario)
    private repositorioUsuario: Repository<Usuario>,
    @InjectRepository(UsuarioRol)
    private repositorioUsuarioRol: Repository<UsuarioRol>,
    @InjectRepository(Rol)
    private repositorioRol: Repository<Rol>,
    @InjectRepository(Credencial)
    private repositorioCredencial: Repository<Credencial>,
  ) {}

  async crear(crearEstudianteDto: CrearEstudianteDto): Promise<EstudianteCreadoConUsuario> {
    const estudianteExistente = await this.repositorioEstudiante.findOne({
      where: { personaId: crearEstudianteDto.personaId },
    });
    if (estudianteExistente) {
      throw new ConflictException('Esta persona ya tiene un estudiante asociado');
    }

    const persona = await this.repositorioPersona.findOne({ where: { id: crearEstudianteDto.personaId } });
    if (!persona) {
      throw new NotFoundException('Persona no encontrada');
    }

    if (crearEstudianteDto.numeroTituloBachiller) {
      const tituloExistente = await this.repositorioEstudiante.findOne({
        where: { numeroTituloBachiller: crearEstudianteDto.numeroTituloBachiller },
      });
      if (tituloExistente) {
        throw new ConflictException('Ya existe un estudiante con este número de título de bachiller');
      }
    }

    if (crearEstudianteDto.numeroFolder) {
      const folderExistente = await this.repositorioEstudiante.findOne({
        where: { numeroFolder: crearEstudianteDto.numeroFolder },
      });
      if (folderExistente) {
        throw new ConflictException('Ya existe un estudiante con este número de folder');
      }
    }

    let codigoInscripcion = crearEstudianteDto.codigoInscripcion;
    if (!codigoInscripcion) {
      codigoInscripcion = await this.generarCodigoInscripcion(
        persona,
        crearEstudianteDto.carreraId
      );
    } else {
      const codigoExistente = await this.repositorioEstudiante.findOne({
        where: { codigoInscripcion },
      });
      if (codigoExistente) {
        throw new ConflictException('El código de inscripción ya existe');
      }
    }

    const datosEstudiante = { ...crearEstudianteDto, inscription_code: codigoInscripcion };
    const estudiante = this.repositorioEstudiante.create(datosEstudiante);
    const estudianteGuardado = await this.repositorioEstudiante.save(estudiante);

    const anioActual = new Date().getFullYear().toString();

    const nombreUsuario = `est_${estudianteGuardado.codigoInscripcion.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const contrasena = `${persona.ci}-${anioActual}`;

    const hashContrasena = await bcrypt.hash(contrasena, 10);
    const usuario = this.repositorioUsuario.create({
      personaId: estudianteGuardado.personaId,
      nombreUsuario,
      contrasenaHash: hashContrasena,
      estado: 'activo' as any,
    });
    const usuarioGuardado = await this.repositorioUsuario.save(usuario);

    const rolEstudiante = await this.repositorioRol.findOne({ where: { codigo: 'estudiante' } });
    if (rolEstudiante) {
      const usuarioRol = this.repositorioUsuarioRol.create({
        usuarioId: usuarioGuardado.id,
        rolId: rolEstudiante.id,
      });
      await this.repositorioUsuarioRol.save(usuarioRol);
    }

    return {
      estudiante: estudianteGuardado,
      usuario: {
        nombreUsuario,
        contrasena,
      },
    } as any;
  }

  async obtenerTodos(
    pagina = 1,
    limite = 20,
    estado?: EstadoEstudiante,
    carreraId?: number,
  ): Promise<any> {
    const consulta = this.repositorioEstudiante
      .createQueryBuilder('estudiante')
      .leftJoinAndSelect('estudiante.persona', 'persona')
      .leftJoinAndSelect('estudiante.carrera', 'carrera')
      .leftJoinAndSelect('estudiante.plan_estudio', 'plan_estudio');

    if (estado) {
      consulta.andWhere('estudiante.estado = :estado', { estado });
    }

    if (carreraId) {
      consulta.andWhere('estudiante.carreraId = :carreraId', { carreraId });
    }

    const [datos, total] = await consulta
      .orderBy('estudiante.codigoInscripcion', 'DESC')
      .skip((pagina - 1) * limite)
      .take(limite)
      .getManyAndCount();

    return { datos, total, pagina, limite };
  }

  async obtenerUno(id: number): Promise<Estudiante> {
    const estudiante = await this.repositorioEstudiante.findOne({
      where: { id },
      relations: ['persona', 'carrera', 'plan_estudio'],
    });
    if (!estudiante) {
      throw new NotFoundException(`Estudiante con ID ${id} no encontrado`);
    }
    return estudiante;
  }

  async buscarPorCodigoInscripcion(codigo: string): Promise<Estudiante> {
    const estudiante = await this.repositorioEstudiante.findOne({
      where: { codigoInscripcion: codigo },
      relations: ['persona', 'carrera', 'plan_estudio'],
    });
    if (!estudiante) {
      throw new NotFoundException(`Estudiante con código de inscripción ${codigo} no encontrado`);
    }
    return estudiante;
  }

  async actualizar(id: number, actualizarEstudianteDto: ActualizarEstudianteDto): Promise<Estudiante> {
    const estudiante = await this.obtenerUno(id);

    if (actualizarEstudianteDto.numeroTituloBachiller) {
      const tituloExistente = await this.repositorioEstudiante.findOne({
        where: { numeroTituloBachiller: actualizarEstudianteDto.numeroTituloBachiller },
      });
      if (tituloExistente && tituloExistente.id !== id) {
        throw new ConflictException('Ya existe otro estudiante con este número de título de bachiller');
      }
    }

    if (actualizarEstudianteDto.numeroFolder) {
      const folderExistente = await this.repositorioEstudiante.findOne({
        where: { numeroFolder: actualizarEstudianteDto.numeroFolder },
      });
      if (folderExistente && folderExistente.id !== id) {
        throw new ConflictException('Ya existe otro estudiante con este número de folder');
      }
    }

    Object.assign(estudiante, actualizarEstudianteDto);
    return this.repositorioEstudiante.save(estudiante as any) as any;
  }

  async eliminar(id: number): Promise<void> {
    const estudiante = await this.obtenerUno(id);

    await this.repositorioCredencial.delete({ estudianteId: id });

    const usuario = await this.repositorioUsuario.findOne({
      where: { personaId: estudiante.personaId },
    });
    if (usuario) {
      await this.repositorioUsuarioRol.delete({ usuarioId: usuario.id });
      await this.repositorioUsuario.remove(usuario);
    }

    const personaId = estudiante.personaId;
    await this.repositorioEstudiante.remove(estudiante);

    const persona = await this.repositorioPersona.findOne({ where: { id: personaId } });
    if (persona) {
      await this.repositorioPersona.remove(persona);
    }
  }

  async buscarPorCarrera(carreraId: number, gestion?: string): Promise<Estudiante[]> {
    const consulta = this.repositorioEstudiante
      .createQueryBuilder('estudiante')
      .leftJoinAndSelect('estudiante.persona', 'persona')
      .where('estudiante.carreraId = :carreraId', { carreraId });

    if (gestion) {
      consulta.andWhere('estudiante.gestionAdmision = :gestion', { gestion });
    }

    return consulta.orderBy('estudiante.codigoInscripcion', 'ASC').getMany();
  }

  async buscarActivos(): Promise<Estudiante[]> {
    return this.repositorioEstudiante.find({
      where: { estado: EstadoEstudiante.ACTIVO },
      relations: ['persona', 'carrera'],
      order: { codigoInscripcion: 'ASC' },
    });
  }

  async contarPorEstado(carreraId?: number): Promise<{ estado: string; cantidad: number }[]> {
    const consulta = this.repositorioEstudiante
      .createQueryBuilder('estudiante')
      .select('estudiante.estado', 'estado')
      .addSelect('COUNT(*)', 'cantidad')
      .groupBy('estudiante.estado');

    if (carreraId) {
      consulta.where('estudiante.carreraId = :carreraId', { carreraId });
    }

    return consulta.getRawMany();
  }

  async obtenerEstadisticasEstudiante(): Promise<any> {
    const estadisticas = await this.repositorioEstudiante
      .createQueryBuilder('estudiante')
      .select('estudiante.estado', 'estado')
      .addSelect('COUNT(*)', 'cantidad')
      .groupBy('estudiante.estado')
      .getRawMany();

    const resultado = { total: 0, activos: 0, egresados: 0, congelados: 0 };
    estadisticas.forEach((fila) => {
      const cantidad = parseInt(fila.cantidad);
      resultado.total += cantidad;
      if (fila.estado === EstadoEstudiante.ACTIVO) resultado.activos = cantidad;
      if (fila.estado === EstadoEstudiante.EGRESADO || fila.estado === EstadoEstudiante.TITULADO) resultado.egresados += cantidad;
      if (fila.estado === EstadoEstudiante.CONGELADO) resultado.congelados = cantidad;
    });

    return resultado;
  }

  private async generarCodigoInscripcion(persona: Persona, carreraId: number): Promise<string> {
    const carrera = await this.repositorioEstudiante.manager.findOne(
      Carrera,
      { where: { id: carreraId } }
    ) as Carrera | null;

    if (!carrera) {
      throw new BadRequestException('Carrera no encontrada');
    }

    const gestion = new Date().getFullYear().toString();
    const sufijoAnio = gestion.slice(-2);

    const iniciales = (
      (persona.apellidoPaterno?.[0] || '') +
      (persona.apellidoMaterno?.[0] || '') +
      (persona.nombres?.[0] || '')
    ).toUpperCase();

    const codigoCarrera = carrera.nombre.substring(0, 2).toUpperCase();

    const ciUltimos2 = persona.ci.slice(-2);

    let codigo = `${iniciales}-${codigoCarrera}${sufijoAnio}${ciUltimos2}`;

    let contador = 1;
    while (await this.repositorioEstudiante.findOne({ where: { codigoInscripcion: codigo } })) {
      codigo = `${iniciales}-${codigoCarrera}${sufijoAnio}${ciUltimos2}-${contador}`;
      contador++;
    }

    return codigo;
  }
}
