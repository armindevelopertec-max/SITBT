import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Turno } from '../../entities/turno.entity';
import { CrearTurnoDto } from './dto/crear-turno.dto';
import { ActualizarTurnoDto } from './dto/actualizar-turno.dto';

@Injectable()
export class ServicioTurnos {
  constructor(
    @InjectRepository(Turno)
    private turnoRepository: Repository<Turno>,
  ) {}

  async create(crearTurnoDto: CrearTurnoDto): Promise<Turno> {
    const existing = await this.turnoRepository.findOne({
      where: { code: crearTurnoDto.code },
    });
    if (existing) {
      throw new ConflictException(`Turno con código ${crearTurnoDto.code} ya existe`);
    }
    const shift = this.turnoRepository.create(crearTurnoDto);
    return this.turnoRepository.save(shift);
  }

  async findAll(
    page = 1,
    limit = 20,
  ): Promise<{ data: Turno[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.turnoRepository
      .createQueryBuilder('shift')
      .orderBy('shift.start_time', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Turno> {
    const shift = await this.turnoRepository.findOne({ where: { id } });
    if (!shift) {
      throw new NotFoundException(`Turno con ID ${id} no encontrado`);
    }
    return shift;
  }

  async findByCode(code: string): Promise<Turno> {
    const shift = await this.turnoRepository.findOne({ where: { code } });
    if (!shift) {
      throw new NotFoundException(`Turno con código ${code} no encontrado`);
    }
    return shift;
  }

  async update(id: number, actualizarTurnoDto: ActualizarTurnoDto): Promise<Turno> {
    const shift = await this.findOne(id);
    Object.assign(shift, actualizarTurnoDto);
    return this.turnoRepository.save(shift);
  }

  async remove(id: number): Promise<void> {
    const shift = await this.findOne(id);
    await this.turnoRepository.remove(shift);
  }

  async findAllShifts(): Promise<Turno[]> {
    return this.turnoRepository.find({
      order: { start_time: 'ASC' },
    });
  }
}