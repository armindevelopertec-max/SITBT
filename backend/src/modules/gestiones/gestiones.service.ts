import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Gestion } from '../../entities/gestion.entity';
import { EstadoGestion } from '../../entities/enums/gestion-status.enum';
import { TipoPeriodo } from '../../entities/enums/period-type.enum';
import { Periodo } from '../../entities/periodo.entity';
import { CrearGestionDto } from './dto/create-gestion.dto';
import { UpdateGestionDto } from './dto/update-gestion.dto';
import { CreatePeriodoDto, UpdatePeriodoDto } from './dto/periodo.dto';

@Injectable()
export class GestionesService {
  constructor(
    @InjectRepository(Gestion)
    private readonly gestionRepository: Repository<Gestion>,
    @InjectRepository(Periodo)
    private readonly periodoRepository: Repository<Periodo>,
    private readonly dataSource: DataSource,
  ) {}

  async create(crearGestionDto: CrearGestionDto): Promise<Gestion> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existing = await this.gestionRepository.findOne({
        where: { anio: createGestionDto.anio },
      });

      if (existing) {
        throw new BadRequestException(`La gestión ${createGestionDto.anio} ya existe`);
      }

      if (createGestionDto.esActual) {
        await this.clearCurrentGestion();
      }

      const gestion = this.gestionRepository.create({
        year: createGestionDto.anio,
        period_type: createGestionDto.tipoPeriodo || TipoPeriodo.SEMESTRAL,
        status: createGestionDto.estado || EstadoGestion.PENDIENTE,
        is_current: createGestionDto.esActual || false,
        notes: createGestionDto.notas,
      });

      const savedGestion = await queryRunner.manager.save(gestion);

      await this.createPeriodosForGestion(queryRunner.manager, savedGestion, createGestionDto.tipoPeriodo || TipoPeriodo.SEMESTRAL);

      await queryRunner.commitTransaction();
      return this.findOne(savedGestion.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async createPeriodosForGestion(
    manager: any,
    gestion: Gestion,
    periodType: TipoPeriodo,
  ): Promise<void> {
    const year = parseInt(gestion.anio);
    const periodos: Partial<Periodo>[] = [];

    switch (periodType) {
      case TipoPeriodo.SEMESTRAL:
        periodos.push(
          {
            gestion_id: gestion.id,
            number: 'I',
            name: 'Primer Semestre',
            start_date: new Date(year, 1, 20),
            end_date: new Date(year, 6, 10),
            status: EstadoGestion.PENDIENTE,
          },
          {
            gestion_id: gestion.id,
            number: 'II',
            name: 'Segundo Semestre',
            start_date: new Date(year, 6, 20),
            end_date: new Date(year, 11, 11),
            status: EstadoGestion.PENDIENTE,
          },
        );
        break;
    }

    for (const periodo of periodos) {
      await manager.save(Periodo, periodo);
    }
  }

  async findAll(
    page = 1,
    limit = 20,
    status?: EstadoGestion,
  ): Promise<{ data: Gestion[]; total: number; page: number; limit: number }> {
    const query = this.gestionRepository.createQueryBuilder('gestion');

    if (status) {
      query.andWhere('gestion.estado = :status', { status });
    }

    query.orderBy('gestion.anio', 'DESC');
    query.skip((page - 1) * limit).take(limit);
    query.leftJoinAndSelect('gestion.periodos', 'periodos');

    const [data, total] = await query.getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Gestion> {
    const gestion = await this.gestionRepository.findOne({
      where: { id },
      relations: ['periodos'],
    });
    if (!gestion) {
      throw new NotFoundException(`Gestión con ID ${id} no encontrada`);
    }
    return gestion;
  }

  async findByYear(year: string): Promise<Gestion> {
    const gestion = await this.gestionRepository.findOne({
      where: { year },
      relations: ['periodos'],
    });
    if (!gestion) {
      throw new NotFoundException(`Gestión ${year} no encontrada`);
    }
    return gestion;
  }

  async findActive(): Promise<Gestion[]> {
    return this.gestionRepository.find({
      where: { estado: EstadoGestion.ABIERTA },
      relations: ['periodos'],
      order: { year: 'DESC' },
    });
  }

  async findCurrent(): Promise<Gestion | null> {
    const gestion = await this.gestionRepository.findOne({
      where: { esActual: true },
      relations: ['periodos'],
    });
    return gestion;
  }

  async update(id: number, updateGestionDto: UpdateGestionDto): Promise<Gestion> {
    const gestion = await this.findOne(id);

    if (updateGestionDto.anio && updateGestionDto.anio !== gestion.anio) {
      const existing = await this.gestionRepository.findOne({
        where: { anio: updateGestionDto.anio },
      });
      if (existing) {
        throw new BadRequestException(`La gestión ${updateGestionDto.anio} ya existe`);
      }
    }

    if (updateGestionDto.esActual) {
      await this.clearCurrentGestion();
    }

    Object.assign(gestion, updateGestionDto);
    return this.gestionRepository.save(gestion);
  }

  async remove(id: number): Promise<void> {
    const gestion = await this.findOne(id);
    await this.periodoRepository.delete({ gestion_id: id });
    await this.gestionRepository.remove(gestion);
  }

  async open(id: number): Promise<Gestion> {
    const gestion = await this.findOne(id);
    gestion.estado = EstadoGestion.ABIERTA;
    return this.gestionRepository.save(gestion);
  }

  async close(id: number): Promise<Gestion> {
    const gestion = await this.findOne(id);
    gestion.estado = EstadoGestion.CERRADA;
    for (const periodo of gestion.periodos) {
      if (periodo.estado === EstadoGestion.ABIERTA) {
        periodo.estado = EstadoGestion.CERRADA;
        await this.periodoRepository.save(periodo);
      }
    }
    return this.gestionRepository.save(gestion);
  }

  async setCurrent(id: number): Promise<Gestion> {
    await this.clearCurrentGestion();
    const gestion = await this.findOne(id);
    gestion.esActual = true;
    return this.gestionRepository.save(gestion);
  }

  private async clearCurrentGestion(): Promise<void> {
    await this.gestionRepository.update(
      { is_current: true },
      { is_current: false },
    );
  }

  async createPeriodo(gestionId: number, createPeriodoDto: CreatePeriodoDto): Promise<Periodo> {
    const gestion = await this.findOne(gestionId);
    const periodo = this.periodoRepository.create({
      ...createPeriodoDto,
      gestion_id: gestion.id,
    });
    return this.periodoRepository.save(periodo);
  }

  async updatePeriodo(periodoId: number, updatePeriodoDto: UpdatePeriodoDto): Promise<Periodo> {
    const periodo = await this.periodoRepository.findOne({ where: { id: periodoId } });
    if (!periodo) {
      throw new NotFoundException(`Período con ID ${periodoId} no encontrado`);
    }
    Object.assign(periodo, updatePeriodoDto);
    return this.periodoRepository.save(periodo);
  }

  async deletePeriodo(periodoId: number): Promise<void> {
    const periodo = await this.periodoRepository.findOne({ where: { id: periodoId } });
    if (!periodo) {
      throw new NotFoundException(`Período con ID ${periodoId} no encontrado`);
    }
    await this.periodoRepository.remove(periodo);
  }

  async openPeriodo(periodoId: number): Promise<Periodo> {
    const periodo = await this.periodoRepository.findOne({
      where: { id: periodoId },
      relations: ['gestion'],
    });
    if (!periodo) {
      throw new NotFoundException(`Período con ID ${periodoId} no encontrado`);
    }

    await this.periodoRepository.update(
      { gestion_id: periodo.gestionId, status: EstadoGestion.ABIERTA },
      { status: EstadoGestion.CERRADA },
    );

    periodo.estado = EstadoGestion.ABIERTA;
    return this.periodoRepository.save(periodo);
  }

  async closePeriodo(periodoId: number): Promise<Periodo> {
    const periodo = await this.periodoRepository.findOne({ where: { id: periodoId } });
    if (!periodo) {
      throw new NotFoundException(`Período con ID ${periodoId} no encontrado`);
    }
    periodo.estado = EstadoGestion.CERRADA;
    return this.periodoRepository.save(periodo);
  }
}
