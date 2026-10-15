import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Carrera, EstadoCarrera } from '../../entities/carrera.entity';
import { CrearCarreraDto } from './dto/crear-carrera.dto';
import { ActualizarCarreraDto } from './dto/actualizar-carrera.dto';

@Injectable()
export class ServicioCarreras {
  constructor(
    @InjectRepository(Carrera)
    private repositorioCarrera: Repository<Carrera>,
  ) {}

  async crear(crearCarreraDto: CrearCarreraDto): Promise<Carrera> {
    const existente = await this.repositorioCarrera.findOne({
      where: { codigo: crearCarreraDto.codigo },
    });
    if (existente) {
      throw new ConflictException(`Carrera con código ${crearCarreraDto.codigo} ya existe`);
    }
    const carrera = this.repositorioCarrera.create(crearCarreraDto);
    return this.repositorioCarrera.save(carrera);
  }

  async obtenerTodos(
    pagina = 1,
    limite = 20,
    estado?: EstadoCarrera,
  ): Promise<{ datos: Carrera[]; total: number; pagina: number; limite: number }> {
    const consulta = this.repositorioCarrera.createQueryBuilder('carrera');

    if (estado) {
      consulta.where('carrera.estado = :estado', { estado: estado });
    }

    const [datos, total] = await consulta
      .orderBy('carrera.nombre', 'ASC')
      .skip((pagina - 1) * limite)
      .take(limite)
      .getManyAndCount();

    return { datos, total, pagina, limite };
  }

  async obtenerUno(id: number): Promise<Carrera> {
    const carrera = await this.repositorioCarrera.findOne({ where: { id } });
    if (!carrera) {
      throw new NotFoundException(`Carrera con ID ${id} no encontrada`);
    }
    return carrera;
  }

  async buscarPorCodigo(codigo: string): Promise<Carrera> {
    const carrera = await this.repositorioCarrera.findOne({ where: { codigo } });
    if (!carrera) {
      throw new NotFoundException(`Carrera con código ${codigo} no encontrada`);
    }
    return carrera;
  }

  async actualizar(id: number, actualizarCarreraDto: ActualizarCarreraDto): Promise<Carrera> {
    const carrera = await this.obtenerUno(id);
    Object.assign(carrera, actualizarCarreraDto);
    return this.repositorioCarrera.save(carrera);
  }

  async eliminar(id: number): Promise<void> {
    const carrera = await this.obtenerUno(id);
    await this.repositorioCarrera.remove(carrera);
  }

  async obtenerActivos(): Promise<Carrera[]> {
    return this.repositorioCarrera.find({
      where: { estado: EstadoCarrera.ACTIVO },
      order: { nombre: 'ASC' },
    });
  }

  async buscarPorArea(area: string): Promise<Carrera[]> {
    return this.repositorioCarrera.find({
      where: { area, estado: EstadoCarrera.ACTIVO },
      order: { nombre: 'ASC' },
    });
  }
}
