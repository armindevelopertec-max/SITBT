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
    private repositorioTurno: Repository<Turno>,
  ) {}

  async crear(crearTurnoDto: CrearTurnoDto): Promise<Turno> {
    const existente = await this.repositorioTurno.findOne({
      where: { codigo: crearTurnoDto.codigo },
    });
    if (existente) {
      throw new ConflictException(`Turno con código ${crearTurnoDto.codigo} ya existe`);
    }
    const turno = this.repositorioTurno.create({
      codigo: crearTurnoDto.codigo,
      nombre: crearTurnoDto.nombre,
      horaInicio: crearTurnoDto.horaInicio,
      horaFin: crearTurnoDto.horaFin,
    });
    return this.repositorioTurno.save(turno);
  }

  async obtenerTodos(
    pagina = 1,
    limite = 20,
  ): Promise<{ datos: Turno[]; total: number; pagina: number; limite: number }> {
    const [datos, total] = await this.repositorioTurno
      .createQueryBuilder('turno')
      .orderBy('turno.horaInicio', 'ASC')
      .skip((pagina - 1) * limite)
      .take(limite)
      .getManyAndCount();

    return { datos, total, pagina, limite };
  }

  async obtenerUno(id: number): Promise<Turno> {
    const turno = await this.repositorioTurno.findOne({ where: { id } });
    if (!turno) {
      throw new NotFoundException(`Turno con ID ${id} no encontrado`);
    }
    return turno;
  }

  async buscarPorCodigo(codigo: string): Promise<Turno> {
    const turno = await this.repositorioTurno.findOne({ where: { codigo } });
    if (!turno) {
      throw new NotFoundException(`Turno con código ${codigo} no encontrado`);
    }
    return turno;
  }

  async actualizar(id: number, actualizarTurnoDto: ActualizarTurnoDto): Promise<Turno> {
    const turno = await this.obtenerUno(id);
    Object.assign(turno, actualizarTurnoDto);
    return this.repositorioTurno.save(turno);
  }

  async eliminar(id: number): Promise<void> {
    const turno = await this.obtenerUno(id);
    await this.repositorioTurno.remove(turno);
  }

  async obtenerTodosTurnos(): Promise<Turno[]> {
    return this.repositorioTurno.find({
      order: { horaInicio: 'ASC' },
    });
  }
}
