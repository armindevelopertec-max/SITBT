import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegistroAuditoria } from '../../entidades/registro-auditoria.entidad';

@Injectable()
export class ServicioAuditoria {
  constructor(
    @InjectRepository(RegistroAuditoria)
    private repositorioAuditoria: Repository<RegistroAuditoria>,
  ) {}

  async crear(registro: Partial<RegistroAuditoria>): Promise<RegistroAuditoria> {
    const registroAuditoria = this.repositorioAuditoria.create(registro);
    return this.repositorioAuditoria.save(registroAuditoria);
  }

  async obtenerTodos(
    pagina = 1,
    limite = 50,
    usuarioId?: number,
    accion?: string,
    tabla?: string,
    fechaInicio?: Date,
    fechaFin?: Date,
  ): Promise<{ datos: RegistroAuditoria[]; total: number; pagina: number; limite: number }> {
    const consulta = this.repositorioAuditoria
      .createQueryBuilder('auditoria')
      .leftJoinAndSelect('auditoria.usuario', 'usuario');

    if (usuarioId) {
      consulta.andWhere('auditoria.usuarioId = :usuarioId', { usuarioId });
    }

    if (accion) {
      consulta.andWhere('auditoria.accion = :accion', { accion });
    }

    if (tabla) {
      consulta.andWhere('auditoria.tabla = :tabla', { tabla });
    }

    if (fechaInicio && fechaFin) {
      consulta.andWhere('auditoria.fecha BETWEEN :fechaInicio AND :fechaFin', { fechaInicio, fechaFin });
    }

    const [datos, total] = await consulta
      .orderBy('auditoria.fecha', 'DESC')
      .skip((pagina - 1) * limite)
      .take(limite)
      .getManyAndCount();

    return { datos, total, pagina, limite };
  }

  async buscarPorUsuario(usuarioId: number, limite = 50): Promise<RegistroAuditoria[]> {
    return this.repositorioAuditoria.find({
      where: { usuarioId },
      order: { fecha: 'DESC' },
      take: limite,
    });
  }

  async buscarPorTabla(nombreTabla: string, limite = 50): Promise<RegistroAuditoria[]> {
    return this.repositorioAuditoria.find({
      where: { tabla: nombreTabla },
      order: { fecha: 'DESC' },
      take: limite,
    });
  }

  async buscarPorRegistro(nombreTabla: string, registroId: number): Promise<RegistroAuditoria[]> {
    return this.repositorioAuditoria.find({
      where: { tabla: nombreTabla, registroId },
      order: { fecha: 'DESC' },
    });
  }

  async obtenerAccionesRecientes(limite = 20): Promise<RegistroAuditoria[]> {
    return this.repositorioAuditoria.find({
      relations: ['usuario'],
      order: { fecha: 'DESC' },
      take: limite,
    });
  }

  async obtenerEstadisticasAcciones(fechaInicio?: Date, fechaFin?: Date): Promise<{ action: string; count: number }[]> {
    const consulta = this.repositorioAuditoria
      .createQueryBuilder('auditoria')
      .select('auditoria.accion', 'action')
      .addSelect('COUNT(*)', 'count')
      .groupBy('auditoria.accion');

    if (fechaInicio && fechaFin) {
      consulta.where('auditoria.fecha BETWEEN :fechaInicio AND :fechaFin', { fechaInicio, fechaFin });
    }

    return consulta.getRawMany();
  }
}
