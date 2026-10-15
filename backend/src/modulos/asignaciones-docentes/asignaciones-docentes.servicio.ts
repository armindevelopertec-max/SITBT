import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AsignacionDocente, EstadoAsignacionDocente } from '../../entidades/asignacion-docente.entidad';
import { CrearAsignacionDocenteDto } from './dto/crear-asignacion-docente.dto';
import { ActualizarAsignacionDocenteDto } from './dto/actualizar-asignacion-docente.dto';

@Injectable()
export class ServicioAsignacionesDocentes {
  constructor(
    @InjectRepository(AsignacionDocente)
    private repositorioAsignacion: Repository<AsignacionDocente>,
  ) {}

  async crear(dtoCreacion: CrearAsignacionDocenteDto): Promise<AsignacionDocente> {
    const asignacion = this.repositorioAsignacion.create(dtoCreacion);
    return this.repositorioAsignacion.save(asignacion as any) as any;
  }

  async obtenerTodos(
    pagina = 1,
    limite = 20,
    gestion?: string,
    estado?: EstadoAsignacionDocente,
  ): Promise<{ datos: AsignacionDocente[]; total: number; pagina: number; limite: number }> {
    const consulta = this.repositorioAsignacion
      .createQueryBuilder('asignacion')
      .leftJoinAndSelect('asignacion.docente', 'docente')
      .leftJoinAndSelect('docente.persona', 'persona')
      .leftJoinAndSelect('asignacion.materia', 'materia')
      .leftJoinAndSelect('asignacion.grupo', 'grupo');

    if (gestion) {
      consulta.andWhere('asignacion.gestion = :gestion', { gestion });
    }

    if (estado) {
      consulta.andWhere('asignacion.estado = :estado', { estado });
    }

    const [datos, total] = await consulta
      .orderBy('asignacion.gestion', 'DESC')
      .skip((pagina - 1) * limite)
      .take(limite)
      .getManyAndCount();

    return { datos, total, pagina, limite };
  }

  async obtenerUno(id: number): Promise<AsignacionDocente> {
    const asignacion = await this.repositorioAsignacion.findOne({
      where: { id },
      relations: ['docente', 'docente.persona', 'materia', 'grupo'],
    });
    if (!asignacion) {
      throw new NotFoundException(`Asignación docente con ID ${id} no encontrada`);
    }
    return asignacion;
  }

  async actualizar(id: number, dtoActualizacion: ActualizarAsignacionDocenteDto): Promise<AsignacionDocente> {
    const asignacion = await this.obtenerUno(id);
    Object.assign(asignacion, dtoActualizacion);
    return this.repositorioAsignacion.save(asignacion as any) as any;
  }

  async eliminar(id: number): Promise<void> {
    const asignacion = await this.obtenerUno(id);
    await this.repositorioAsignacion.remove(asignacion);
  }

  async buscarPorDocente(docenteId: number, gestion?: string): Promise<AsignacionDocente[]> {
    const consulta = this.repositorioAsignacion
      .createQueryBuilder('asignacion')
      .leftJoinAndSelect('asignacion.materia', 'materia')
      .leftJoinAndSelect('asignacion.grupo', 'grupo')
      .where('asignacion.docenteId = :docenteId', { docenteId });

    if (gestion) {
      consulta.andWhere('asignacion.gestion = :gestion', { gestion });
    }

    return consulta.orderBy('asignacion.gestion', 'DESC').getMany();
  }

  async buscarPorGrupo(grupoId: number, gestion: string): Promise<AsignacionDocente[]> {
    return this.repositorioAsignacion.find({
      where: { grupoId, gestion },
      relations: ['docente', 'docente.persona', 'materia'],
    });
  }

  async buscarPorMateria(materiaId: number, gestion: string): Promise<AsignacionDocente[]> {
    return this.repositorioAsignacion.find({
      where: { materiaId, gestion },
      relations: ['docente', 'docente.persona', 'grupo'],
    });
  }

  async buscarActivos(gestion: string): Promise<AsignacionDocente[]> {
    return this.repositorioAsignacion.find({
      where: { gestion, estado: EstadoAsignacionDocente.ACTIVO },
      relations: ['docente', 'docente.persona', 'materia', 'grupo'],
      order: { creadoEn: 'DESC' },
    });
  }
}
