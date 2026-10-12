import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConsentRecord, TipoConsentimiento } from '../../entities/consent-record.entity';
import { CrearConsentimientoDto } from './dto/crear-consentimiento.dto';
import { ActualizarConsentimientoDto } from './dto/actualizar-consentimiento.dto';

@Injectable()
export class ServicioConsentimiento {
  constructor(
    @InjectRepository(ConsentRecord)
    private consentimientoRepository: Repository<ConsentRecord>,
  ) {}

  async create(createDto: CrearConsentimientoDto): Promise<ConsentRecord> {
    const consent = this.consentimientoRepository.create({
      ...createDto,
      fechaConsentimiento: new Date(),
    } as Partial<ConsentRecord>);
    return this.consentimientoRepository.save(consent);
  }

  async findAll(
    page = 1,
    limit = 20,
    estudianteId?: number,
  ): Promise<{ data: ConsentRecord[]; total: number; page: number; limit: number }> {
    const query = this.consentimientoRepository
      .createQueryBuilder('consent')
      .leftJoinAndSelect('consent.estudiante', 'estudiante')
      .leftJoinAndSelect('estudiante.person', 'person');

    if (estudianteId) {
      query.andWhere('consent.estudiante_id = :estudianteId', { estudianteId });
    }

    const [data, total] = await query
      .orderBy('consent.fechaConsentimiento', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<ConsentRecord> {
    const consent = await this.consentimientoRepository.findOne({
      where: { id },
      relations: ['estudiante', 'estudiante.person'],
    });
    if (!consent) {
      throw new NotFoundException(`Consent record with ID ${id} no encontrado`);
    }
    return consent;
  }

  async findByStudent(estudianteId: number): Promise<ConsentRecord[]> {
    return this.consentimientoRepository.find({
      where: { estudianteId: estudianteId },
      order: { fechaConsentimiento: 'DESC' },
    });
  }

  async getLatestConsent(estudianteId: number): Promise<ConsentRecord | null> {
    return this.consentimientoRepository.findOne({
      where: { estudianteId: estudianteId },
      order: { fechaConsentimiento: 'DESC' },
    });
  }

  async update(id: string, updateDto: ActualizarConsentimientoDto): Promise<ConsentRecord> {
    const consent = await this.findOne(id);
    Object.assign(consent, updateDto);
    return this.consentimientoRepository.save(consent);
  }

  async exerciseRight(id: string, derecho: TipoConsentimiento, registradoPor?: number): Promise<ConsentRecord> {
    const consent = await this.findOne(id);
    consent.derechoEjercido = derecho;
    consent.derechoFecha = new Date();
    if (registradoPor) {
      consent.registered_by = registradoPor;
    }
    return this.consentimientoRepository.save(consent);
  }

  async hasValidConsent(estudianteId: number, versionPolitica: string): Promise<boolean> {
    const consent = await this.consentimientoRepository.findOne({
      where: {
        student_id: estudianteId,
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
