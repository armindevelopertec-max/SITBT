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
      where: { codigo: crearTurnoDto.codigo },
    });
    if (existing) {
      throw new ConflictException(`Turno con código ${crearTurnoDto.codigo} ya existe`);
    }
    const turno = this.turnoRepository.create({
      codigo: crearTurnoDto.codigo,
      nombre: crearTurnoDto.nombre,
      horaInicio: crearTurnoDto.horaInicio,
      horaFin: crearTurnoDto.horaFin,
    });
    return this.turnoRepository.save(turno);
  }

  async findAll(
    page = 1,
    limit = 20,
  ): Promise<{ datos: Turno[]; total: number; pagina: number; limite: number }> {
    const [data, total] = await this.turnoRepository
      .createQueryBuilder('turno')
      .orderBy('turno.horaInicio', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { datos: data, total, pagina: page, limite: limit };
  }

  async findOne(id: number): Promise<Turno> {
    const turno = await this.turnoRepository.findOne({ where: { id } });
    if (!turno) {
      throw new NotFoundException(`Turno con ID ${id} no encontrado`);
    }
    return turno;
  }

  async findByCodigo(codigo: string): Promise<Turno> {
    const turno = await this.turnoRepository.findOne({ where: { codigo: undefined } });
    if (!turno) {
      throw new NotFoundException(`Turno con código ${codigo} no encontrado`);
    }
    return turno;
  }

  async update(id: number, actualizarTurnoDto: ActualizarTurnoDto): Promise<Turno> {
    const turno = await this.findOne(id);
    Object.assign(turno, actualizarTurnoDto);
    return this.turnoRepository.save(turno);
  }

  async remove(id: number): Promise<void> {
    const turno = await this.findOne(id);
    await this.turnoRepository.remove(turno);
  }

  async findAllTurnos(): Promise<Turno[]> {
    return this.turnoRepository.find({
      order: { horaInicio: 'ASC' },
    });
  }
}