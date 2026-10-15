import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Materia } from '../../entidades/materia.entidad';
import { CrearMateriaDto } from './dto/crear-materia.dto';
import { ActualizarMateriaDto } from './dto/actualizar-materia.dto';

@Injectable()
export class ServicioMaterias {
  constructor(
    @InjectRepository(Materia)
    private repositorioMateria: Repository<Materia>,
  ) {}

  async crear(crearMateriaDto: CrearMateriaDto): Promise<Materia> {
    const existente = await this.repositorioMateria.findOne({
      where: { codigo: crearMateriaDto.codigo },
    });
    if (existente) {
      throw new ConflictException(`Materia con código ${crearMateriaDto.codigo} ya existe`);
    }
    const materia = this.repositorioMateria.create(crearMateriaDto);
    return this.repositorioMateria.save(materia);
  }

  async obtenerTodos(
    pagina = 1,
    limite = 20,
  ): Promise<{ datos: Materia[]; total: number; pagina: number; limite: number }> {
    const [datos, total] = await this.repositorioMateria
      .createQueryBuilder('materia')
      .orderBy('materia.nombre', 'ASC')
      .skip((pagina - 1) * limite)
      .take(limite)
      .getManyAndCount();

    return { datos, total, pagina, limite };
  }

  async obtenerTodosMaterias(): Promise<Materia[]> {
    return this.repositorioMateria.find({
      order: { nombre: 'ASC' },
    });
  }

  async obtenerUno(id: number): Promise<Materia> {
    const materia = await this.repositorioMateria.findOne({ where: { id } });
    if (!materia) {
      throw new NotFoundException(`Materia con ID ${id} no encontrada`);
    }
    return materia;
  }

  async buscarPorCodigo(codigo: string): Promise<Materia> {
    const materia = await this.repositorioMateria.findOne({ where: { codigo } });
    if (!materia) {
      throw new NotFoundException(`Materia con código ${codigo} no encontrada`);
    }
    return materia;
  }

  async actualizar(id: number, actualizarMateriaDto: ActualizarMateriaDto): Promise<Materia> {
    const materia = await this.obtenerUno(id);
    Object.assign(materia, actualizarMateriaDto);
    return this.repositorioMateria.save(materia);
  }

  async eliminar(id: number): Promise<void> {
    const materia = await this.obtenerUno(id);
    await this.repositorioMateria.remove(materia);
  }

  async buscar(consulta: string): Promise<Materia[]> {
    return this.repositorioMateria
      .createQueryBuilder('materia')
      .where('materia.nombre ILIKE :consulta', { consulta: `%${consulta}%` })
      .orWhere('materia.codigo ILIKE :consulta', { consulta: `%${consulta}%` })
      .orderBy('materia.nombre', 'ASC')
      .getMany();
  }
}
