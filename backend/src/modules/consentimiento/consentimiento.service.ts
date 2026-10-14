import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegistroConsentimiento, TipoConsentimiento } from '../../entities/consent-record.entity';
import { CrearConsentimientoDto } from './dto/crear-consentimiento.dto';
import { ActualizarConsentimientoDto } from './dto/actualizar-consentimiento.dto';

@Injectable()
export class ServicioConsentimiento {
  constructor(
    @InjectRepository(RegistroConsentimiento)
    private consentimientoRepository: Repository<RegistroConsentimiento>,
  ) {}

  async create(createDto: CrearConsentimientoDto): Promise<RegistroConsentimiento> {
    const consent = this.consentimientoRepository.create({
      ...createDto,
      fechaConsentimiento: new Date(),
    } as Partial<RegistroConsentimiento>);
    return this.consentimientoRepository.save(consent);
  }

  async findAll(
    page = 1,
    limit = 20,
    estudianteId?: number,
  ): Promise<{ data: RegistroConsentimiento[]; total: number; page: number; limit: number }> {
    const query = this.consentimientoRepository
      .createQueryBuilder('consent')
      .leftJoinAndSelect('consent.estudiante', 'estudiante')
      .leftJoinAndSelect('estudiante.persona', 'person');

    if (estudianteId) {
      query.andWhere('consent.estudianteId = :estudianteId', { estudianteId });
    }

    const [data, total] = await query
      .orderBy('consent.fechaConsentimiento', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<RegistroConsentimiento> {
    const consent = await this.consentimientoRepository.findOne({
      where: { id },
      relations: ['estudiante', 'estudiante.persona'],
    });
    if (!consent) {
      throw new NotFoundException(`Consent record with ID ${id} no encontrado`);
    }
    return consent;
  }

  async findByStudent(estudianteId: number): Promise<RegistroConsentimiento[]> {
    return this.consentimientoRepository.find({
      where: { estudianteId: estudianteId },
      order: { fechaConsentimiento: 'DESC' },
    });
  }

  async getLatestConsent(estudianteId: number): Promise<RegistroConsentimiento | null> {
    return this.consentimientoRepository.findOne({
      where: { estudianteId: estudianteId },
      order: { fechaConsentimiento: 'DESC' },
    });
  }

  async update(id: string, updateDto: ActualizarConsentimientoDto): Promise<RegistroConsentimiento> {
    const consent = await this.findOne(id);
    Object.assign(consent, updateDto);
    return this.consentimientoRepository.save(consent);
  }

  async exerciseRight(id: string, derecho: TipoConsentimiento, registradoPor?: number): Promise<RegistroConsentimiento> {
    const consent = await this.findOne(id);
    consent.derechoEjercido = derecho;
    consent.derechoFecha = new Date();
    if (registradoPor) {
      consent.registradoPor = registradoPor;
    }
    return this.consentimientoRepository.save(consent);
  }

  async hasValidConsent(estudianteId: number, versionPolitica: string): Promise<boolean> {
    const consent = await this.consentimientoRepository.findOne({
      where: {
        estudianteId: estudianteId,
        versionPolitica,
      },
    });
    return !!consent;
  }

  async remove(id: string): Promise<void> {
    const consent = await this.findOne(id);
    await this.consentimientoRepository.remove(consent);
  }
}
