import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Calificacion,
  EstadoCalificacionRegular,
  EstadoCalificacion2T,
  EstadoCalificacionDefinitivo,
} from '../../entities/calificacion.entity';
import { AuditoriaCalificacion } from '../../entities/auditoria-calificacion.entity';
import { Inscripcion } from '../../entities/inscripcion.entity';
import { CrearCalificacionDto } from './dto/crear-calificacion.dto';
import { ActualizarCalificacionDto } from './dto/actualizar-calificacion.dto';

@Injectable()
export class ServicioCalificaciones {
  constructor(
    @InjectRepository(Calificacion)
    private repositorioCalificacion: Repository<Calificacion>,
    @InjectRepository(AuditoriaCalificacion)
    private repositorioAuditoriaCalificacion: Repository<AuditoriaCalificacion>,
    @InjectRepository(Inscripcion)
    private repositorioInscripcion: Repository<Inscripcion>,
  ) {}

  async crear(crearCalificacionDto: CrearCalificacionDto): Promise<Calificacion> {
    const existente = await this.repositorioCalificacion.findOne({
      where: { inscripcionId: crearCalificacionDto.inscripcionId },
    });

    if (existente) {
      throw new BadRequestException('Ya existe una calificación para esta inscripción');
    }

    const calificacion = this.repositorioCalificacion.create(crearCalificacionDto);
    return this.repositorioCalificacion.save(calificacion);
  }

  async obtenerTodos(
    pagina = 1,
    limite = 20,
    gestion?: string,
    estadoDefinitivo?: EstadoCalificacionDefinitivo,
  ): Promise<{ datos: Calificacion[]; total: number; pagina: number; limite: number }> {
    const consulta = this.repositorioCalificacion
      .createQueryBuilder('calificacion')
      .leftJoinAndSelect('calificacion.inscripcion', 'inscripcion')
      .leftJoinAndSelect('inscripcion.estudiante', 'estudiante')
      .leftJoinAndSelect('estudiante.persona', 'person')
      .leftJoinAndSelect('inscripcion.materia', 'materia')
      .leftJoinAndSelect('inscripcion.grupo', 'grupo');

    if (gestion) {
      consulta.andWhere('inscripcion.gestion = :gestion', { gestion });
    }

    if (estadoDefinitivo) {
      consulta.andWhere('calificacion.estadoDefinitivo = :estadoDefinitivo', { estadoDefinitivo });
    }

    const [datos, total] = await consulta
      .orderBy('calificacion.registradoEn', 'DESC')
      .skip((pagina - 1) * limite)
      .take(limite)
      .getManyAndCount();

    return { datos, total, pagina, limite };
  }

  async obtenerUno(id: number): Promise<Calificacion> {
    const calificacion = await this.repositorioCalificacion.findOne({
      where: { id },
      relations: ['inscripcion', 'inscripcion.estudiante', 'inscripcion.estudiante.persona', 'inscripcion.materia', 'docente'],
    });
    if (!calificacion) {
      throw new NotFoundException(`Calificación con ID ${id} no encontrada`);
    }
    return calificacion;
  }

  async buscarPorInscripcion(inscripcionId: number): Promise<Calificacion> {
    const calificacion = await this.repositorioCalificacion.findOne({
      where: { inscripcionId },
      relations: ['inscripcion', 'inscripcion.estudiante', 'inscripcion.estudiante.persona', 'inscripcion.materia'],
    });
    if (!calificacion) {
      throw new NotFoundException(`Calificación de la inscripción ${inscripcionId} no encontrada`);
    }
    return calificacion;
  }

  async actualizar(
    id: number,
    actualizarCalificacionDto: ActualizarCalificacionDto,
    registradoPor: number,
  ): Promise<Calificacion> {
    const calificacion = await this.obtenerUno(id);
    const valorAnterior = JSON.stringify(calificacion);

    Object.assign(calificacion, actualizarCalificacionDto);
    const calificacionGuardada = await this.repositorioCalificacion.save(calificacion);

    await this.repositorioAuditoriaCalificacion.save({
      calificacionId: id,
      field_changed: 'multiple',
      old_value: valorAnterior,
      new_value: JSON.stringify(actualizarCalificacionDto),
      changed_by: registradoPor,
    });

    return calificacionGuardada;
  }

  async eliminar(id: number): Promise<void> {
    const calificacion = await this.obtenerUno(id);
    await this.repositorioCalificacion.remove(calificacion);
  }

  async actualizarParciales(
    id: number,
    parcial1?: number,
    parcial2?: number,
    registradoPor?: number,
  ): Promise<Calificacion> {
    const calificacion = await this.obtenerUno(id);

    if (parcial1 !== undefined) calificacion.parcial1 = parcial1;
    if (parcial2 !== undefined) calificacion.parcial2 = parcial2;

    if (calificacion.parcial1 !== null && calificacion.parcial2 !== null) {
      calificacion.promedioFinal = Math.round((calificacion.parcial1 + calificacion.parcial2) / 2);
      calificacion.estadoRegular = calificacion.promedioFinal >= 51 ? EstadoCalificacionRegular.APROBADO : EstadoCalificacionRegular.REPROBADO;
    }

    const calificacionGuardada = await this.repositorioCalificacion.save(calificacion);

    if (registradoPor) {
      await this.repositorioAuditoriaCalificacion.save({
        calificacionId: id,
        field_changed: 'partials',
        old_value: JSON.stringify({ partial1: calificacion.parcial1, partial2: calificacion.parcial2 }),
        new_value: JSON.stringify({ partial1: parcial1, partial2: parcial2 }),
        changed_by: registradoPor,
      });
    }

    return calificacionGuardada;
  }

  async aplicarSegundaTurno(id: number, nota: number, registradoPor?: number): Promise<Calificacion> {
    const calificacion = await this.obtenerUno(id);

    if (!calificacion.aptoSegundaTurno) {
      throw new BadRequestException('El estudiante no es elegible para el segundo turno');
    }

    calificacion.notaSegundaTurno = nota;
    calificacion.segundaTurnoAplicado = true;
    calificacion.estado2T = nota >= 51 ? EstadoCalificacion2T.APROBADO : EstadoCalificacion2T.REPROBADO;

    if (calificacion.estadoRegular === EstadoCalificacionRegular.REPROBADO && calificacion.estado2T === EstadoCalificacion2T.APROBADO) {
      calificacion.notaDefinitiva = nota;
      calificacion.estadoDefinitivo = EstadoCalificacionDefinitivo.APROBADO;
    } else if (calificacion.estado2T === EstadoCalificacion2T.REPROBADO) {
      calificacion.notaDefinitiva = calificacion.estadoRegular === EstadoCalificacionRegular.APROBADO ? calificacion.promedioFinal : nota;
      calificacion.estadoDefinitivo = EstadoCalificacionDefinitivo.REPROBADO;
    } else {
      calificacion.notaDefinitiva = nota;
      calificacion.estadoDefinitivo = EstadoCalificacionDefinitivo.APROBADO;
    }

    const calificacionGuardada = await this.repositorioCalificacion.save(calificacion);

    if (registradoPor) {
      await this.repositorioAuditoriaCalificacion.save({
        calificacionId: id,
        field_changed: 'second_turn',
        old_value: JSON.stringify({ second_turn_applied: false }),
        new_value: JSON.stringify({ second_turn_score: nota, second_turn_applied: true }),
        changed_by: registradoPor,
      });
    }

    return calificacionGuardada;
  }

  async obtenerHistorialCalificaciones(inscripcionId: number): Promise<AuditoriaCalificacion[]> {
    return this.repositorioAuditoriaCalificacion.find({
      where: { calificacionId: inscripcionId },
      relations: ['usuario'],
      order: { cambiadoEn: 'DESC' },
    });
  }

  async obtenerCalificacionesPorEstudiante(estudianteId: number, gestion?: string): Promise<Calificacion[]> {
    const consulta = this.repositorioCalificacion
      .createQueryBuilder('calificacion')
      .leftJoinAndSelect('calificacion.inscripcion', 'inscripcion')
      .leftJoinAndSelect('inscripcion.materia', 'materia')
      .leftJoinAndSelect('inscripcion.grupo', 'grupo')
      .where('inscripcion.estudianteId = :estudianteId', { estudianteId });

    if (gestion) {
      consulta.andWhere('inscripcion.gestion = :gestion', { gestion });
    }

    return consulta.orderBy('inscripcion.gestion', 'ASC').getMany();
  }

  async obtenerCalificacionesPorGrupo(grupoId: number, gestion: string): Promise<Calificacion[]> {
    return this.repositorioCalificacion
      .createQueryBuilder('calificacion')
      .leftJoinAndSelect('calificacion.inscripcion', 'inscripcion')
      .leftJoinAndSelect('inscripcion.estudiante', 'estudiante')
      .leftJoinAndSelect('estudiante.persona', 'person')
      .leftJoinAndSelect('inscripcion.materia', 'materia')
      .where('inscripcion.grupoId = :grupoId', { grupoId })
      .andWhere('inscripcion.gestion = :gestion', { gestion })
      .orderBy('person.apellidoPaterno', 'ASC')
      .getMany();
  }
}
