import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegistroConsentimiento, TipoConsentimiento } from '../../entidades/registro-consentimiento.entidad';
import { CrearConsentimientoDto } from './dto/crear-consentimiento.dto';
import { ActualizarConsentimientoDto } from './dto/actualizar-consentimiento.dto';

@Injectable()
export class ServicioConsentimiento {
  constructor(
    @InjectRepository(RegistroConsentimiento)
    private repositorioConsentimiento: Repository<RegistroConsentimiento>,
  ) {}

  async crear(crearDto: CrearConsentimientoDto): Promise<RegistroConsentimiento> {
    const consentimiento = this.repositorioConsentimiento.create({
      ...crearDto,
      fechaConsentimiento: new Date(),
    } as Partial<RegistroConsentimiento>);
    return this.repositorioConsentimiento.save(consentimiento);
  }

  async obtenerTodos(
    pagina = 1,
    limite = 20,
    estudianteId?: number,
  ): Promise<{ datos: RegistroConsentimiento[]; total: number; pagina: number; limite: number }> {
    const consulta = this.repositorioConsentimiento
      .createQueryBuilder('consentimiento')
      .leftJoinAndSelect('consentimiento.estudiante', 'estudiante')
      .leftJoinAndSelect('estudiante.persona', 'persona');

    if (estudianteId) {
      consulta.andWhere('consentimiento.estudianteId = :estudianteId', { estudianteId });
    }

    const [datos, total] = await consulta
      .orderBy('consentimiento.fechaConsentimiento', 'DESC')
      .skip((pagina - 1) * limite)
      .take(limite)
      .getManyAndCount();

    return { datos, total, pagina, limite };
  }

  async obtenerUno(id: string): Promise<RegistroConsentimiento> {
    const consentimiento = await this.repositorioConsentimiento.findOne({
      where: { id },
      relations: ['estudiante', 'estudiante.persona'],
    });
    if (!consentimiento) {
      throw new NotFoundException(`Consent record with ID ${id} no encontrado`);
    }
    return consentimiento;
  }

  async buscarPorEstudiante(estudianteId: number): Promise<RegistroConsentimiento[]> {
    return this.repositorioConsentimiento.find({
      where: { estudianteId: estudianteId },
      order: { fechaConsentimiento: 'DESC' },
    });
  }

  async obtenerUltimoConsentimiento(estudianteId: number): Promise<RegistroConsentimiento | null> {
    return this.repositorioConsentimiento.findOne({
      where: { estudianteId: estudianteId },
      order: { fechaConsentimiento: 'DESC' },
    });
  }

  async actualizar(id: string, actualizarDto: ActualizarConsentimientoDto): Promise<RegistroConsentimiento> {
    const consentimiento = await this.obtenerUno(id);
    Object.assign(consentimiento, actualizarDto);
    return this.repositorioConsentimiento.save(consentimiento);
  }

  async ejercerDerecho(id: string, derecho: TipoConsentimiento, registradoPor?: number): Promise<RegistroConsentimiento> {
    const consentimiento = await this.obtenerUno(id);
    consentimiento.derechoEjercido = derecho;
    consentimiento.derechoFecha = new Date();
    if (registradoPor) {
      consentimiento.registradoPor = registradoPor;
    }
    return this.repositorioConsentimiento.save(consentimiento);
  }

  async tieneConsentimientoValido(estudianteId: number, versionPolitica: string): Promise<boolean> {
    const consentimiento = await this.repositorioConsentimiento.findOne({
      where: {
        estudianteId: estudianteId,
        versionPolitica,
      },
    });
    return !!consentimiento;
  }

  async eliminar(id: string): Promise<void> {
    const consentimiento = await this.obtenerUno(id);
    await this.repositorioConsentimiento.remove(consentimiento);
  }
}
