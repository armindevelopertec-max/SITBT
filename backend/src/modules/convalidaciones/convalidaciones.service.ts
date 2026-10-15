import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConvalidacionEstudiante, EstadoConvalidacion, TipoConvalidacion } from '../../entities/convalidacion-estudiante.entity';
import { CrearConvalidacionDto } from './dto/crear-convalidacion.dto';
import { ActualizarConvalidacionDto } from './dto/actualizar-convalidacion.dto';

@Injectable()
export class ServicioConvalidaciones {
  constructor(
    @InjectRepository(ConvalidacionEstudiante)
    private repositorioConvalidacion: Repository<ConvalidacionEstudiante>,
  ) {}

  async crear(dtoCreacion: CrearConvalidacionDto): Promise<ConvalidacionEstudiante> {
    const convalidacion = this.repositorioConvalidacion.create(dtoCreacion);
    return this.repositorioConvalidacion.save(convalidacion);
  }

  async obtenerTodos(
    pagina = 1,
    limite = 20,
    estado?: EstadoConvalidacion,
    tipo?: TipoConvalidacion,
    estudianteId?: number,
  ): Promise<{ datos: ConvalidacionEstudiante[]; total: number; pagina: number; limite: number }> {
    const consulta = this.repositorioConvalidacion
      .createQueryBuilder('convalidacion')
      .leftJoinAndSelect('convalidacion.estudiante', 'estudiante')
      .leftJoinAndSelect('estudiante.persona', 'persona')
      .leftJoinAndSelect('convalidacion.materia_destino', 'materia')
      .leftJoinAndSelect('convalidacion.equivalencia', 'equivalencia')
      .leftJoinAndSelect('convalidacion.aprobador', 'aprobador');

    if (estado) {
      consulta.andWhere('convalidacion.estado = :estado', { estado });
    }

    if (tipo) {
      consulta.andWhere('convalidacion.tipo = :tipo', { tipo });
    }

    if (estudianteId) {
      consulta.andWhere('convalidacion.estudianteId = :estudianteId', { estudianteId });
    }

    const [datos, total] = await consulta
      .orderBy('convalidacion.creadoEn', 'DESC')
      .skip((pagina - 1) * limite)
      .take(limite)
      .getManyAndCount();

    return { datos, total, pagina, limite };
  }

  async obtenerUno(id: number): Promise<ConvalidacionEstudiante> {
    const convalidacion = await this.repositorioConvalidacion.findOne({
      where: { id },
      relations: ['estudiante', 'estudiante.persona', 'materia_destino', 'equivalencia', 'aprobador'],
    });
    if (!convalidacion) {
      throw new NotFoundException(`Convalidación con ID ${id} no encontrada`);
    }
    return convalidacion;
  }

  async actualizar(id: number, dtoActualizacion: ActualizarConvalidacionDto): Promise<ConvalidacionEstudiante> {
    const convalidacion = await this.obtenerUno(id);
    Object.assign(convalidacion, dtoActualizacion);
    return this.repositorioConvalidacion.save(convalidacion);
  }

  async eliminar(id: number): Promise<void> {
    const convalidacion = await this.obtenerUno(id);
    await this.repositorioConvalidacion.remove(convalidacion);
  }

  async buscarPorEstudiante(estudianteId: number): Promise<ConvalidacionEstudiante[]> {
    return this.repositorioConvalidacion.find({
      where: { estudianteId },
      relations: ['materia_destino', 'equivalencia', 'aprobador'],
      order: { creadoEn: 'DESC' },
    });
  }

  async aprobar(id: number, aprobadoPor: number, numeroResolucion?: string, fechaResolucion?: Date): Promise<ConvalidacionEstudiante> {
    const convalidacion = await this.obtenerUno(id);
    convalidacion.estado = EstadoConvalidacion.APROBADA;
    convalidacion.aprobadoPor = aprobadoPor;
    if (numeroResolucion) convalidacion.numeroResolucion = numeroResolucion;
    if (fechaResolucion) convalidacion.fechaResolucion = fechaResolucion;
    return this.repositorioConvalidacion.save(convalidacion);
  }

  async rechazar(id: number): Promise<ConvalidacionEstudiante> {
    const convalidacion = await this.obtenerUno(id);
    convalidacion.estado = EstadoConvalidacion.RECHAZADA;
    return this.repositorioConvalidacion.save(convalidacion);
  }

  async obtenerPendientes(): Promise<ConvalidacionEstudiante[]> {
    return this.repositorioConvalidacion.find({
      where: { estado: EstadoConvalidacion.PENDIENTE },
      relations: ['estudiante', 'estudiante.persona', 'materia_destino'],
      order: { creadoEn: 'ASC' },
    });
  }
}
