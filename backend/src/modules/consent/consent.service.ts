import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConsentRecord, ConsentType } from '../../entities/consent-record.entity';
import { CreateConsentDto } from './dto/create-consent.dto';
import { UpdateConsentDto } from './dto/update-consent.dto';

@Injectable()
export class ConsentService {
  constructor(
    @InjectRepository(ConsentRecord)
    private consentRepository: Repository<ConsentRecord>,
  ) {}

  async create(createDto: CreateConsentDto): Promise<ConsentRecord> {
    const consent = this.consentRepository.create({
      ...createDto,
      fechaConsentimiento: new Date(),
    } as Partial<ConsentRecord>);
    return this.consentRepository.save(consent);
  }

  async findAll(
    page = 1,
    limit = 20,
    estudianteId?: number,
  ): Promise<{ data: ConsentRecord[]; total: number; page: number; limit: number }> {
    const query = this.consentRepository
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
    const consent = await this.consentRepository.findOne({
      where: { id },
      relations: ['estudiante', 'estudiante.person'],
    });
    if (!consent) {
      throw new NotFoundException(`Consent record with ID ${id} not found`);
    }
    return consent;
  }

  async findByStudent(estudianteId: number): Promise<ConsentRecord[]> {
    return this.consentRepository.find({
      where: { estudiante_id: estudianteId },
      order: { fechaConsentimiento: 'DESC' },
    });
  }

  async getLatestConsent(estudianteId: number): Promise<ConsentRecord | null> {
    return this.consentRepository.findOne({
      where: { estudiante_id: estudianteId },
      order: { fechaConsentimiento: 'DESC' },
    });
  }

  async update(id: string, updateDto: UpdateConsentDto): Promise<ConsentRecord> {
    const consent = await this.findOne(id);
    Object.assign(consent, updateDto);
    return this.consentRepository.save(consent);
  }

  async exerciseRight(id: string, derecho: ConsentType, registradoPor?: number): Promise<ConsentRecord> {
    const consent = await this.findOne(id);
    consent.derechoEjercido = derecho;
    consent.derechoFecha = new Date();
    if (registradoPor) {
      consent.registrado_por = registradoPor;
    }
    return this.consentRepository.save(consent);
  }

  async hasValidConsent(estudianteId: number, versionPolitica: string): Promise<boolean> {
    const consent = await this.consentRepository.findOne({
      where: {
        estudiante_id: estudianteId,
        versionPolitica,
      },
    });
    return !!consent;
  }

  async remove(id: string): Promise<void> {
    const consent = await this.findOne(id);
    await this.consentRepository.remove(consent);
  }
}
