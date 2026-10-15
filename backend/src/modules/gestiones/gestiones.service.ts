import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Gestion } from '../../entities/gestion.entity';
import { EstadoGestion } from '../../entities/enums/estado-gestion.enum';
import { TipoPeriodo } from '../../entities/enums/tipo-periodo.enum';
import { Periodo } from '../../entities/periodo.entity';
import { CrearGestionDto } from './dto/create-gestion.dto';
import { ActualizarGestionDto } from './dto/update-gestion.dto';
import { CrearPeriodoDto, ActualizarPeriodoDto } from './dto/periodo.dto';

@Injectable()
export class ServicioGestiones {
  constructor(
    @InjectRepository(Gestion)
    private readonly repositorioGestion: Repository<Gestion>,
    @InjectRepository(Periodo)
    private readonly repositorioPeriodo: Repository<Periodo>,
    private readonly fuenteDatos: DataSource,
  ) {}

  async crear(crearGestionDto: CrearGestionDto): Promise<Gestion> {
    const ejecutorConsultas = this.fuenteDatos.createQueryRunner();
    await ejecutorConsultas.connect();
    await ejecutorConsultas.startTransaction();

    try {
      const existente = await this.repositorioGestion.findOne({
        where: { anio: crearGestionDto.anio },
      });

      if (existente) {
        throw new BadRequestException(`La gestión ${crearGestionDto.anio} ya existe`);
      }

      if (crearGestionDto.esActual) {
        await this.limpiarGestionActual();
      }

      const gestion = this.repositorioGestion.create({
        anio: crearGestionDto.anio,
        tipoPeriodo: crearGestionDto.tipoPeriodo || TipoPeriodo.SEMESTRAL,
        estado: crearGestionDto.estado || EstadoGestion.PENDIENTE,
        esActual: crearGestionDto.esActual || false,
        notas: crearGestionDto.notas,
      });

      const gestionCreada = await ejecutorConsultas.manager.save(gestion);

      await this.crearPeriodosParaGestion(ejecutorConsultas.manager, gestionCreada, crearGestionDto.tipoPeriodo || TipoPeriodo.SEMESTRAL);

      await ejecutorConsultas.commitTransaction();
      const gestionGuardada = Array.isArray(gestionCreada) ? gestionCreada[0] : gestionCreada;
      return this.obtenerUno(gestionGuardada.id);
    } catch (error) {
      await ejecutorConsultas.rollbackTransaction();
      throw error;
    } finally {
      await ejecutorConsultas.release();
    }
  }

  private async crearPeriodosParaGestion(
    manager: any,
    gestion: Gestion,
    tipoPeriodo: TipoPeriodo,
  ): Promise<void> {
    const anio = parseInt(gestion.anio);
    const periodos: Partial<Periodo>[] = [];

    switch (tipoPeriodo) {
      case TipoPeriodo.SEMESTRAL:
        periodos.push(
          {
            gestionId: gestion.id,
            numero: 'I',
            nombre: 'Primer Semestre',
            fechaInicio: new Date(anio, 1, 20),
            fechaFin: new Date(anio, 6, 10),
            estado: EstadoGestion.PENDIENTE,
          },
          {
            gestionId: gestion.id,
            numero: 'II',
            nombre: 'Segundo Semestre',
            fechaInicio: new Date(anio, 6, 20),
            fechaFin: new Date(anio, 11, 11),
            estado: EstadoGestion.PENDIENTE,
          },
        );
        break;
    }

    for (const periodo of periodos) {
      await manager.save(Periodo, periodo);
    }
  }

  async obtenerTodos(
    pagina = 1,
    limite = 20,
    estado?: EstadoGestion,
  ): Promise<{ datos: Gestion[]; total: number; pagina: number; limite: number }> {
    const consulta = this.repositorioGestion.createQueryBuilder('gestion');

    if (estado) {
      consulta.andWhere('gestion.estado = :estado', { estado });
    }

    consulta.orderBy('gestion.anio', 'DESC');
    consulta.skip((pagina - 1) * limite).take(limite);
    consulta.leftJoinAndSelect('gestion.periodos', 'periodos');

    const [datos, total] = await consulta.getManyAndCount();

    return { datos, total, pagina, limite };
  }

  async obtenerUno(id: number): Promise<Gestion> {
    const gestion = await this.repositorioGestion.findOne({
      where: { id },
      relations: ['periodos'],
    });
    if (!gestion) {
      throw new NotFoundException(`Gestión con ID ${id} no encontrada`);
    }
    return gestion;
  }

  async buscarPorAnio(anio: string): Promise<Gestion> {
    const gestion = await this.repositorioGestion.findOne({
      where: { anio },
      relations: ['periodos'],
    });
    if (!gestion) {
      throw new NotFoundException(`Gestión ${anio} no encontrada`);
    }
    return gestion;
  }

  async obtenerActivos(): Promise<Gestion[]> {
    return this.repositorioGestion.find({
      where: { estado: EstadoGestion.ABIERTA },
      relations: ['periodos'],
      order: { anio: 'DESC' },
    });
  }

  async obtenerActual(): Promise<Gestion | null> {
    const gestion = await this.repositorioGestion.findOne({
      where: { esActual: true },
      relations: ['periodos'],
    });
    return gestion;
  }

  async actualizar(id: number, actualizarGestionDto: ActualizarGestionDto): Promise<Gestion> {
    const gestion = await this.obtenerUno(id);

    if (actualizarGestionDto.anio && actualizarGestionDto.anio !== gestion.anio) {
      const existente = await this.repositorioGestion.findOne({
        where: { anio: actualizarGestionDto.anio },
      });
      if (existente) {
        throw new BadRequestException(`La gestión ${actualizarGestionDto.anio} ya existe`);
      }
    }

    if (actualizarGestionDto.esActual) {
      await this.limpiarGestionActual();
    }

    Object.assign(gestion, actualizarGestionDto);
    return this.repositorioGestion.save(gestion);
  }

  async eliminar(id: number): Promise<void> {
    const gestion = await this.obtenerUno(id);
    await this.repositorioPeriodo.delete({ gestionId: id });
    await this.repositorioGestion.remove(gestion);
  }

  async abrir(id: number): Promise<Gestion> {
    const gestion = await this.obtenerUno(id);
    gestion.estado = EstadoGestion.ABIERTA;
    return this.repositorioGestion.save(gestion);
  }

  async cerrar(id: number): Promise<Gestion> {
    const gestion = await this.obtenerUno(id);
    gestion.estado = EstadoGestion.CERRADA;
    for (const periodo of gestion.periodos) {
      if (periodo.estado === EstadoGestion.ABIERTA) {
        periodo.estado = EstadoGestion.CERRADA;
        await this.repositorioPeriodo.save(periodo);
      }
    }
    return this.repositorioGestion.save(gestion);
  }

  async establecerActual(id: number): Promise<Gestion> {
    await this.limpiarGestionActual();
    const gestion = await this.obtenerUno(id);
    gestion.esActual = true;
    return this.repositorioGestion.save(gestion);
  }

  private async limpiarGestionActual(): Promise<void> {
    await this.repositorioGestion.update(
      { esActual: true },
      { esActual: false },
    );
  }

  async crearPeriodo(gestionId: number, crearPeriodoDto: CrearPeriodoDto): Promise<Periodo> {
    const gestion = await this.obtenerUno(gestionId);
    const periodo = this.repositorioPeriodo.create({
      ...crearPeriodoDto,
      gestionId: gestion.id,
    });
    return this.repositorioPeriodo.save(periodo);
  }

  async actualizarPeriodo(periodoId: number, actualizarPeriodoDto: ActualizarPeriodoDto): Promise<Periodo> {
    const periodo = await this.repositorioPeriodo.findOne({ where: { id: periodoId } });
    if (!periodo) {
      throw new NotFoundException(`Período con ID ${periodoId} no encontrado`);
    }
    Object.assign(periodo, actualizarPeriodoDto);
    return this.repositorioPeriodo.save(periodo);
  }

  async eliminarPeriodo(periodoId: number): Promise<void> {
    const periodo = await this.repositorioPeriodo.findOne({ where: { id: periodoId } });
    if (!periodo) {
      throw new NotFoundException(`Período con ID ${periodoId} no encontrado`);
    }
    await this.repositorioPeriodo.remove(periodo);
  }

  async abrirPeriodo(periodoId: number): Promise<Periodo> {
    const periodo = await this.repositorioPeriodo.findOne({
      where: { id: periodoId },
      relations: ['gestion'],
    });
    if (!periodo) {
      throw new NotFoundException(`Período con ID ${periodoId} no encontrado`);
    }

    await this.repositorioPeriodo.update(
      { gestionId: periodo.gestionId, estado: EstadoGestion.ABIERTA },
      { estado: EstadoGestion.CERRADA },
    );

    periodo.estado = EstadoGestion.ABIERTA;
    return this.repositorioPeriodo.save(periodo);
  }

  async cerrarPeriodo(periodoId: number): Promise<Periodo> {
    const periodo = await this.repositorioPeriodo.findOne({ where: { id: periodoId } });
    if (!periodo) {
      throw new NotFoundException(`Período con ID ${periodoId} no encontrado`);
    }
    periodo.estado = EstadoGestion.CERRADA;
    return this.repositorioPeriodo.save(periodo);
  }
}
