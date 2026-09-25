import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Gestion } from '../../entities/gestion.entity';
import { GestionStatus } from '../../entities/enums/gestion-status.enum';
import { PeriodType } from '../../entities/enums/period-type.enum';
import { Periodo } from '../../entities/periodo.entity';
import { CreateGestionDto } from './dto/create-gestion.dto';
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

  async create(createGestionDto: CreateGestionDto): Promise<Gestion> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existing = await this.gestionRepository.findOne({
        where: { year: createGestionDto.year },
      });

      if (existing) {
        throw new BadRequestException(`La gestión ${createGestionDto.year} ya existe`);
      }

      if (createGestionDto.is_current) {
        await this.clearCurrentGestion();
      }

      const gestion = this.gestionRepository.create({
        year: createGestionDto.year,
        period_type: createGestionDto.period_type || PeriodType.SEMESTRAL,
        status: createGestionDto.status || GestionStatus.PENDIENTE,
        is_current: createGestionDto.is_current || false,
        notes: createGestionDto.notes,
      });

      const savedGestion = await queryRunner.manager.save(gestion);

      await this.createPeriodosForGestion(queryRunner.manager, savedGestion, createGestionDto.period_type || PeriodType.SEMESTRAL);

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
    periodType: PeriodType,
  ): Promise<void> {
    const year = parseInt(gestion.year);
    const periodos: Partial<Periodo>[] = [];

    switch (periodType) {
      case PeriodType.SEMESTRAL:
        periodos.push(
          {
            gestion_id: gestion.id,
            number: 'I',
            name: 'Primer Semestre',
            start_date: new Date(year, 1, 20),
            end_date: new Date(year, 6, 10),
            status: GestionStatus.PENDIENTE,
          },
          {
            gestion_id: gestion.id,
            number: 'II',
            name: 'Segundo Semestre',
            start_date: new Date(year, 6, 20),
            end_date: new Date(year, 11, 11),
            status: GestionStatus.PENDIENTE,
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
    status?: GestionStatus,
  ): Promise<{ data: Gestion[]; total: number; page: number; limit: number }> {
    const query = this.gestionRepository.createQueryBuilder('gestion');

    if (status) {
      query.andWhere('gestion.status = :status', { status });
    }

    query.orderBy('gestion.year', 'DESC');
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
      where: { status: GestionStatus.ABIERTA },
      relations: ['periodos'],
      order: { year: 'DESC' },
    });
  }

  async findCurrent(): Promise<Gestion | null> {
    const gestion = await this.gestionRepository.findOne({
      where: { is_current: true },
      relations: ['periodos'],
    });
    return gestion;
  }

  async update(id: number, updateGestionDto: UpdateGestionDto): Promise<Gestion> {
    const gestion = await this.findOne(id);

    if (updateGestionDto.year && updateGestionDto.year !== gestion.year) {
      const existing = await this.gestionRepository.findOne({
        where: { year: updateGestionDto.year },
      });
      if (existing) {
        throw new BadRequestException(`La gestión ${updateGestionDto.year} ya existe`);
      }
    }

    if (updateGestionDto.is_current) {
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
    gestion.status = GestionStatus.ABIERTA;
    return this.gestionRepository.save(gestion);
  }

  async close(id: number): Promise<Gestion> {
    const gestion = await this.findOne(id);
    gestion.status = GestionStatus.CERRADA;
    for (const periodo of gestion.periodos) {
      if (periodo.status === GestionStatus.ABIERTA) {
        periodo.status = GestionStatus.CERRADA;
        await this.periodoRepository.save(periodo);
      }
    }
    return this.gestionRepository.save(gestion);
  }

  async setCurrent(id: number): Promise<Gestion> {
    await this.clearCurrentGestion();
    const gestion = await this.findOne(id);
    gestion.is_current = true;
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
    const periodo = await this.periodoRepository.findOne({ where: { id: periodoId } });
    if (!periodo) {
      throw new NotFoundException(`Período con ID ${periodoId} no encontrado`);
    }
    periodo.status = GestionStatus.ABIERTA;
    return this.periodoRepository.save(periodo);
  }

  async closePeriodo(periodoId: number): Promise<Periodo> {
    const periodo = await this.periodoRepository.findOne({ where: { id: periodoId } });
    if (!periodo) {
      throw new NotFoundException(`Período con ID ${periodoId} no encontrado`);
    }
    periodo.status = GestionStatus.CERRADA;
    return this.periodoRepository.save(periodo);
  }
}
