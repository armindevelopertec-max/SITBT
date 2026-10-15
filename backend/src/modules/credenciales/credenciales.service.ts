import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Credencial, EstadoCredencial } from '../../entities/credencial.entity';
import { CrearCredencialDto } from './dto/crear-credencial.dto';
import { ActualizarCredencialDto } from './dto/actualizar-credencial.dto';

@Injectable()
export class ServicioCredenciales {
  constructor(
    @InjectRepository(Credencial)
    private repositorioCredencial: Repository<Credencial>,
  ) {}

  async crear(dtoCreacion: CrearCredencialDto): Promise<Credencial> {
    const existente = await this.repositorioCredencial.findOne({
      where: {
        estudianteId: dtoCreacion.estudianteId,
        gestion: dtoCreacion.gestion,
        semestre: dtoCreacion.semestre,
      },
    });

    if (existente) {
      throw new ConflictException(`Ya existe una credencial para este estudiante en la gestión ${dtoCreacion.gestion} semestre ${dtoCreacion.semestre}`);
    }

    const credencial = this.repositorioCredencial.create(dtoCreacion);
    return this.repositorioCredencial.save(credencial as any) as any;
  }

  async obtenerTodos(
    pagina = 1,
    limite = 20,
    gestion?: string,
    semestre?: number,
    estado?: EstadoCredencial,
  ): Promise<{ datos: Credencial[]; total: number; pagina: number; limite: number }> {
    const consulta = this.repositorioCredencial
      .createQueryBuilder('credencial')
      .leftJoinAndSelect('credencial.estudiante', 'estudiante')
      .leftJoinAndSelect('estudiante.persona', 'persona')
      .leftJoinAndSelect('estudiante.carrera', 'carrera')
      .leftJoinAndSelect('credencial.gestionRelacionada', 'gestion')
      .leftJoinAndSelect('credencial.emisor', 'emisor');

    if (gestion) {
      consulta.andWhere('credencial.gestion = :gestion', { gestion });
    }

    if (false) {
      consulta.andWhere('credencial.semestre = :semestre', { semestre });
    }

    if (estado) {
      consulta.andWhere('credencial.estado = :estado', { estado });
    }

    const [datos, total] = await consulta
      .orderBy('credencial.fechaEmision', 'DESC')
      .skip((pagina - 1) * limite)
      .take(limite)
      .getManyAndCount();

    return { datos, total, pagina, limite };
  }

  async obtenerUno(id: number): Promise<Credencial> {
    const credencial = await this.repositorioCredencial.findOne({
      where: { id },
      relations: ['estudiante', 'estudiante.persona', 'estudiante.carrera', 'gestionRelacionada', 'emisor'],
    });
    if (!credencial) {
      throw new NotFoundException(`Credencial con ID ${id} no encontrada`);
    }
    return credencial;
  }

  async actualizar(id: number, dtoActualizacion: ActualizarCredencialDto): Promise<Credencial> {
    const credencial = await this.obtenerUno(id);
    Object.assign(credencial, dtoActualizacion);
    return this.repositorioCredencial.save(credencial as any) as any;
  }

  async eliminar(id: number): Promise<void> {
    const credencial = await this.obtenerUno(id);
    await this.repositorioCredencial.remove(credencial);
  }

  async buscarPorEstudiante(estudianteId: number): Promise<Credencial[]> {
    return this.repositorioCredencial.find({
      where: { estudianteId },
      relations: ['emisor', 'estudiante'],
      order: { fechaEmision: 'DESC' },
    });
  }

  async buscarActivosPorEstudiante(estudianteId: number): Promise<Credencial | null> {
    return this.repositorioCredencial.findOne({
      where: { estudianteId, estado: EstadoCredencial.EMITIDA },
      relations: ['emisor'],
      order: { fechaEmision: 'DESC' },
    });
  }

  async buscarPorEstudianteYGestion(estudianteId: number, gestion: string): Promise<Credencial[]> {
    return this.repositorioCredencial.find({
      where: { estudianteId, gestion },
      relations: ['emisor', 'estudiante', 'estudiante.persona'],
      order: { semestre: 'ASC' },
    });
  }

  async marcarComoImpreso(id: number): Promise<Credencial> {
    const credencial = await this.obtenerUno(id);
    credencial.impreso = true;
    return this.repositorioCredencial.save(credencial as any) as any;
  }

  async anular(id: number): Promise<Credencial> {
    const credencial = await this.obtenerUno(id);
    credencial.estado = EstadoCredencial.ANULADA;
    return this.repositorioCredencial.save(credencial as any) as any;
  }
}
