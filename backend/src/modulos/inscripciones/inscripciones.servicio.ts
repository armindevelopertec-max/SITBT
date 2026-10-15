import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inscripcion, EstadoInscripcion } from '../../entidades/inscripcion.entidad';
import { CrearInscripcionDto } from './dto/crear-inscripcion.dto';
import { ActualizarInscripcionDto } from './dto/actualizar-inscripcion.dto';

@Injectable()
export class ServicioInscripciones {
  constructor(
    @InjectRepository(Inscripcion)
    private repositorioInscripcion: Repository<Inscripcion>,
  ) {}

  async crear(crearInscripcionDto: CrearInscripcionDto): Promise<Inscripcion> {
    const existente = await this.repositorioInscripcion.findOne({
      where: {
        estudianteId: crearInscripcionDto.estudianteId,
        materiaId: crearInscripcionDto.materiaId,
        gestion: crearInscripcionDto.gestion,
      },
    });

    if (existente) {
      throw new BadRequestException('El estudiante ya está inscrito en esta materia para esta gestión');
    }

    const inscripcion = this.repositorioInscripcion.create(crearInscripcionDto);
    return this.repositorioInscripcion.save(inscripcion);
  }

  async obtenerTodos(
    pagina = 1,
    limite = 20,
    gestion?: string,
    estado?: EstadoInscripcion,
    estudianteId?: number,
  ): Promise<{ datos: Inscripcion[]; total: number; pagina: number; limite: number }> {
    const consulta = this.repositorioInscripcion
      .createQueryBuilder('inscripcion')
      .leftJoinAndSelect('inscripcion.estudiante', 'estudiante')
      .leftJoinAndSelect('estudiante.persona', 'person')
      .leftJoinAndSelect('inscripcion.materia', 'materia')
      .leftJoinAndSelect('inscripcion.grupo', 'grupo');

    if (gestion) {
      consulta.andWhere('inscripcion.gestion = :gestion', { gestion });
    }

    if (estado) {
      consulta.andWhere('inscripcion.estado = :estado', { estado });
    }

    if (estudianteId) {
      consulta.andWhere('inscripcion.estudianteId = :estudianteId', { estudianteId });
    }

    const [datos, total] = await consulta
      .orderBy('inscripcion.creadoEn', 'DESC')
      .skip((pagina - 1) * limite)
      .take(limite)
      .getManyAndCount();

    return { datos, total, pagina, limite };
  }

  async obtenerUno(id: number): Promise<Inscripcion> {
    const inscripcion = await this.repositorioInscripcion.findOne({
      where: { id },
      relations: ['estudiante', 'estudiante.persona', 'materia', 'grupo'],
    });
    if (!inscripcion) {
      throw new NotFoundException(`Inscripción con ID ${id} no encontrada`);
    }
    return inscripcion;
  }

  async actualizar(id: number, actualizarInscripcionDto: ActualizarInscripcionDto): Promise<Inscripcion> {
    const inscripcion = await this.obtenerUno(id);
    Object.assign(inscripcion, actualizarInscripcionDto);
    return this.repositorioInscripcion.save(inscripcion);
  }

  async eliminar(id: number): Promise<void> {
    const inscripcion = await this.obtenerUno(id);
    await this.repositorioInscripcion.remove(inscripcion);
  }

  async buscarPorEstudiante(estudianteId: number, gestion?: string): Promise<Inscripcion[]> {
    const consulta = this.repositorioInscripcion
      .createQueryBuilder('inscripcion')
      .leftJoinAndSelect('inscripcion.materia', 'materia')
      .leftJoinAndSelect('inscripcion.grupo', 'grupo')
      .where('inscripcion.estudianteId = :estudianteId', { estudianteId });

    if (gestion) {
      consulta.andWhere('inscripcion.gestion = :gestion', { gestion });
    }

    return consulta.orderBy('inscripcion.semestre', 'ASC').getMany();
  }

  async buscarPorMateria(materiaId: number, gestion: string): Promise<Inscripcion[]> {
    return this.repositorioInscripcion.find({
      where: { materiaId, gestion },
      relations: ['estudiante', 'estudiante.persona', 'grupo'],
      order: { creadoEn: 'ASC' },
    });
  }

  async buscarPorGrupo(grupoId: number, gestion: string): Promise<Inscripcion[]> {
    return this.repositorioInscripcion.find({
      where: { grupoId, gestion },
      relations: ['estudiante', 'estudiante.persona', 'materia'],
      order: { creadoEn: 'ASC' },
    });
  }

  async actualizarEstado(id: number, estado: EstadoInscripcion, notaFinal?: number): Promise<Inscripcion> {
    const inscripcion = await this.obtenerUno(id);
    inscripcion.estado = estado;
    if (notaFinal !== undefined) {
      inscripcion.notaFinal = notaFinal;
    }
    return this.repositorioInscripcion.save(inscripcion);
  }

  async obtenerHistorialAcademicoEstudiante(estudianteId: number): Promise<{
    enrollments: Inscripcion[];
    stats: { aprobadas: number; reprobadas: number; enCurso: number; promedio: number };
  }> {
    const inscripciones = await this.repositorioInscripcion.find({
      where: { estudianteId },
      relations: ['materia', 'grupo'],
      order: { gestion: 'ASC', semestre: 'ASC' },
    });

    const estadisticas = {
      aprobadas: 0,
      reprobadas: 0,
      enCurso: 0,
      promedio: 0,
    };

    let sumaCalificaciones = 0;
    let conteoConCalificacion = 0;

    inscripciones.forEach((inscripcion) => {
      if (inscripcion.estado === EstadoInscripcion.APROBADO) {
        estadisticas.aprobadas++;
        if (inscripcion.notaFinal) {
          sumaCalificaciones += inscripcion.notaFinal;
          conteoConCalificacion++;
        }
      } else if (inscripcion.estado === EstadoInscripcion.REPROBADO) {
        estadisticas.reprobadas++;
      } else if (inscripcion.estado === EstadoInscripcion.CURSANDO) {
        estadisticas.enCurso++;
      }
    });

    if (conteoConCalificacion > 0) {
      estadisticas.promedio = Math.round(sumaCalificaciones / conteoConCalificacion * 100) / 100;
    }

    return { enrollments: inscripciones, stats: estadisticas };
  }

  async crearEnLote(crearInscripcionDtos: CrearInscripcionDto[]): Promise<Inscripcion[]> {
    const inscripciones = crearInscripcionDtos.map((dto) =>
      this.repositorioInscripcion.create(dto),
    );
    return this.repositorioInscripcion.save(inscripciones);
  }
}
