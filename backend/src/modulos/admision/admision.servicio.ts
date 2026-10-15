import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { SolicitudAdmision, EstadoAdmision } from '../../entidades/solicitud-admision.entidad';
import { CrearAdmisionDto } from './dto/crear-admision.dto';
import { ActualizarAdmisionDto } from './dto/actualizar-admision.dto';
import { Persona, Genero } from '../../entidades/persona.entidad';
import { Estudiante, EstadoMatriculaEstudiante, OrigenEstudiante } from '../../entidades/estudiante.entidad';
import { Inscripcion } from '../../entidades/inscripcion.entidad';
import { PlanEstudio } from '../../entidades/plan-estudio.entidad';
import { Carrera } from '../../entidades/carrera.entidad';
import { ConfiguracionInstitucional } from '../../entidades/configuracion-institucional.entidad';

@Injectable()
export class ServicioAdmision {
  constructor(
    @InjectRepository(SolicitudAdmision)
    private repositorioSolicitud: Repository<SolicitudAdmision>,
    @InjectRepository(Persona)
    private repositorioPersona: Repository<Persona>,
    @InjectRepository(Estudiante)
    private repositorioEstudiante: Repository<Estudiante>,
    @InjectRepository(Inscripcion)
    private repositorioInscripcion: Repository<Inscripcion>,
  ) {}

  async crear(crearAdmisionDto: CrearAdmisionDto): Promise<SolicitudAdmision> {
    const estudianteExistente = await this.repositorioEstudiante
      .createQueryBuilder('estudiante')
      .innerJoin('estudiante.persona', 'persona')
      .where('persona.ci = :ci', { ci: crearAdmisionDto.ci })
      .andWhere('estudiante.estado = :estado', { estado: 'activo' })
      .getOne();

    if (estudianteExistente) {
      throw new BadRequestException('Esta persona ya está registrada como estudiante activo en otra carrera');
    }

    if (crearAdmisionDto.correo) {
      const correoExistente = await this.repositorioPersona
        .createQueryBuilder('persona')
        .innerJoin('persona.estudiantes', 'estudiante')
        .where('persona.correo = :correo', { correo: crearAdmisionDto.correo })
        .andWhere('estudiante.estado = :estado', { estado: 'activo' })
        .getOne();
      if (correoExistente) {
        throw new BadRequestException('Ya existe un estudiante activo con este correo electrónico');
      }
    }

    if (crearAdmisionDto.telefono) {
      const telefonoExistente = await this.repositorioPersona
        .createQueryBuilder('persona')
        .innerJoin('persona.estudiantes', 'estudiante')
        .where('persona.telefono = :telefono', { telefono: crearAdmisionDto.telefono })
        .andWhere('estudiante.estado = :estado', { estado: 'activo' })
        .getOne();
      if (telefonoExistente) {
        throw new BadRequestException('Ya existe un estudiante activo con este número de celular');
      }
    }

    const solicitud = this.repositorioSolicitud.create({
      ...crearAdmisionDto,
      fechaNacimiento: new Date(crearAdmisionDto.fechaNacimiento),
    } as Partial<SolicitudAdmision>);
    return this.repositorioSolicitud.save(solicitud as any) as any;
  }

  async obtenerTodos(
    pagina = 1,
    limite = 20,
    estado?: EstadoAdmision,
    origen?: string,
  ): Promise<{ datos: SolicitudAdmision[]; total: number; pagina: number; limite: number }> {
    const consulta = this.repositorioSolicitud
      .createQueryBuilder('solicitud')
      .leftJoinAndSelect('solicitud.carrera', 'carrera');

    if (estado) {
      consulta.andWhere('solicitud.estado = :estado', { estado });
    }

    if (origen) {
      consulta.andWhere('solicitud.origen = :origen', { origen });
    }

    const [datos, total] = await consulta
      .orderBy('solicitud.creadoEn', 'DESC')
      .skip((pagina - 1) * limite)
      .take(limite)
      .getManyAndCount();

    return { datos, total, pagina, limite };
  }

  async obtenerUno(id: string): Promise<SolicitudAdmision> {
    const solicitud = await this.repositorioSolicitud.findOne({
      where: { id },
      relations: ['carrera'],
    });
    if (!solicitud) {
      throw new NotFoundException(`Solicitud de admisión con ID ${id} no encontrada`);
    }
    return solicitud;
  }

  async actualizar(id: string, actualizarAdmisionDto: ActualizarAdmisionDto): Promise<SolicitudAdmision> {
    const solicitud = await this.obtenerUno(id);

    if (actualizarAdmisionDto.estado && actualizarAdmisionDto.estado !== solicitud.estado) {
      if (actualizarAdmisionDto.estado === EstadoAdmision.RECHAZADO && !actualizarAdmisionDto.observaciones) {
        throw new BadRequestException('Observaciones requeridas al rechazar');
      }
    }

    Object.assign(solicitud, actualizarAdmisionDto);
    return this.repositorioSolicitud.save(solicitud as any) as any;
  }

  async verificar(id: string, verificadoPor: number, observaciones?: string): Promise<SolicitudAdmision> {
    return this.actualizar(id, {
      estado: EstadoAdmision.VERIFICADO,
      verificadoPor: verificadoPor,
      observaciones,
    } as ActualizarAdmisionDto);
  }

  async rechazar(id: string, verificadoPor: number, observaciones: string): Promise<SolicitudAdmision> {
    if (!observaciones) {
      throw new BadRequestException('Observaciones requeridas al rechazar');
    }
    return this.actualizar(id, {
      estado: EstadoAdmision.RECHAZADO,
      verificadoPor: verificadoPor,
      observaciones,
    } as ActualizarAdmisionDto);
  }

  async convertirAEstudiante(id: string, gestionAdmision: string): Promise<{ estudiante: Estudiante; persona: Persona }> {
    const solicitud = await this.obtenerUno(id);

    if (solicitud.estado === EstadoAdmision.CONVERTIDO) {
      throw new BadRequestException('Esta solicitud ya fue convertida a estudiante');
    }

    if (solicitud.estado !== EstadoAdmision.VERIFICADO) {
      throw new BadRequestException('La solicitud debe estar verificada para convertir a estudiante');
    }

    if (!solicitud.carreraId) {
      throw new BadRequestException('La solicitud debe tener una carrera asignada');
    }

    const estudianteExistente = await this.repositorioEstudiante.findOne({
      where: { solicitudAdmisionId: id }
    });
    if (estudianteExistente) {
      throw new BadRequestException('Ya existe un estudiante creado para esta solicitud');
    }

    if (solicitud.correo) {
      const correoExistente = await this.repositorioPersona
        .createQueryBuilder('persona')
        .innerJoin('persona.estudiantes', 'estudiante')
        .where('persona.correo = :correo', { correo: solicitud.correo })
        .andWhere('estudiante.estado = :estado', { estado: 'activo' })
        .getOne();
      if (correoExistente) {
        throw new BadRequestException('Ya existe un estudiante activo con este correo electrónico');
      }
    }

    if (solicitud.telefono) {
      const telefonoExistente = await this.repositorioPersona
        .createQueryBuilder('persona')
        .innerJoin('persona.estudiantes', 'estudiante')
        .where('persona.telefono = :telefono', { telefono: solicitud.telefono })
        .andWhere('estudiante.estado = :estado', { estado: 'activo' })
        .getOne();
      if (telefonoExistente) {
        throw new BadRequestException('Ya existe un estudiante activo con este número de celular');
      }
    }

    let persona = await this.repositorioPersona.findOne({ where: { ci: solicitud.ci } });

    const estudianteExistenteEnCarrera = await this.repositorioEstudiante
      .createQueryBuilder('estudiante')
      .innerJoin('estudiante.persona', 'persona')
      .where('persona.ci = :ci', { ci: solicitud.ci })
      .andWhere('estudiante.carreraId = :carreraId', { carreraId: solicitud.carreraId })
      .andWhere('estudiante.estado = :estado', { estado: 'activo' })
      .getOne();

    if (estudianteExistenteEnCarrera) {
      throw new BadRequestException('Esta persona ya está registrada como estudiante activo en esta carrera');
    }

    if (!persona) {
      const lugarNacimientoFinal = solicitud.lugarNacimiento === 'Otra' && solicitud.lugarNacimientoOtro ? solicitud.lugarNacimientoOtro : solicitud.lugarNacimiento;
      const nacionalidadFinal = solicitud.nacionalidad === 'Otra' && solicitud.nacionalidadOtra ? solicitud.nacionalidadOtra : solicitud.nacionalidad;

      persona = (this.repositorioPersona.create as any)({
        ci: solicitud.ci,
        nombres: solicitud.nombre,
        apellidoPaterno: (solicitud as any).apellidoPaterno || solicitud.nombre.split(' ')[0] || solicitud.nombre,
        apellidoMaterno: solicitud.apellidoMaterno || solicitud.nombre.split(' ').slice(1).join(' ') || '',
        fechaNacimiento: new Date(solicitud.fechaNacimiento),
        lugarNacimiento: lugarNacimientoFinal,
        genero: solicitud.genero as any,
        estadoCivil: solicitud.estadoCivil as any,
        nacionalidad: nacionalidadFinal,
        telefono: solicitud.telefono,
        correo: solicitud.correo,
        direccion: solicitud.direccion,
      } as any);
      const guardado = await (this.repositorioPersona.save as any)(persona as any);
      persona = (Array.isArray(guardado) ? guardado[0] : guardado) as Persona;
    }

    const planEstudio = await this.repositorioEstudiante.manager.findOne(
      PlanEstudio,
      { where: { carreraId: solicitud.carreraId, estado: 'vigente' as any } }
    );

    if (!planEstudio) {
      throw new BadRequestException('No existe un plan de estudio vigente para la carrera seleccionada');
    }

    const codigoInscripcion = await this.generarCodigoInscripcion(solicitud);

    const datosEstudiante: DeepPartial<Estudiante> = {
      personaId: persona.id,
      numeroTituloBachiller: undefined,
      fechaTituloBachiller: undefined,
      gestionAdmision: gestionAdmision,
      numeroFolder: undefined,
      codigoInscripcion: codigoInscripcion,
      codigoFormulario01: undefined,
      carreraId: solicitud.carreraId,
      planEstudioId: planEstudio.id,
      fechaAdmision: new Date(),
      estado: 'activo' as any,
      estadoMatricula: EstadoMatriculaEstudiante.MATRICULADO,
      origen: solicitud.origen === 'web' ? OrigenEstudiante.WEB : OrigenEstudiante.SECRETARIA,
      solicitudAdmisionId: solicitud.id,
      verificadoPor: solicitud.verificadoPor || undefined,
      fechaVerificacion: new Date(),
      fechaPreRegistro: solicitud.creadoEn,
    };

    const estudiante = this.repositorioEstudiante.create(datosEstudiante);

    const estudianteGuardado = (await this.repositorioEstudiante.save(estudiante)) as Estudiante;

    solicitud.estado = EstadoAdmision.CONVERTIDO;
    solicitud.estudianteConvertidoId = estudianteGuardado.id;
    await this.repositorioSolicitud.save(solicitud);

    return { estudiante: estudianteGuardado, persona };
  }

  private async generarCodigoInscripcion(solicitud: SolicitudAdmision): Promise<string> {
    const carrera = await this.repositorioEstudiante.manager.findOne(
      Carrera,
      { where: { id: solicitud.carreraId } }
    ) as Carrera | null;

    if (!carrera) {
      throw new BadRequestException('Carrera no encontrada');
    }

    const gestion = new Date().getFullYear().toString();
    const sufijoAnio = gestion.slice(-2);

    const iniciales = (
      (solicitud.apellidoPaterno?.[0] || '') +
      (solicitud.apellidoMaterno?.[0] || '') +
      (solicitud.nombre?.[0] || '')
    ).toUpperCase();

    const codigoCarrera = carrera.nombre.substring(0, 2).toUpperCase();

    const ultimos2Ci = solicitud.ci.slice(-2);

    let codigo = `${iniciales}-${codigoCarrera}${sufijoAnio}${ultimos2Ci}`;

    let contador = 1;
    while (await this.repositorioEstudiante.findOne({ where: { codigoInscripcion: codigo } })) {
      codigo = `${iniciales}-${codigoCarrera}${sufijoAnio}${ultimos2Ci}-${contador}`;
      contador++;
    }

    return codigo;
  }

  async eliminar(id: string): Promise<void> {
    const solicitud = await this.obtenerUno(id);
    await this.repositorioSolicitud.remove(solicitud);
  }

  async obtenerEstadisticas(): Promise<{
    total: number;
    pendientes: number;
    verificados: number;
    rechazados: number;
    convertidos: number;
  }> {
    const total = await this.repositorioSolicitud.count();
    const pendientes = await this.repositorioSolicitud.count({ where: { estado: EstadoAdmision.PENDIENTE } });
    const verificados = await this.repositorioSolicitud.count({ where: { estado: EstadoAdmision.VERIFICADO } });
    const rechazados = await this.repositorioSolicitud.count({ where: { estado: EstadoAdmision.RECHAZADO } });
    const convertidos = await this.repositorioSolicitud.count({ where: { estado: EstadoAdmision.CONVERTIDO } });

    return { total, pendientes, verificados, rechazados, convertidos };
  }
}
