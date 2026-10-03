import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstitutionSettings } from '../../entities/institution-settings.entity';
import { CreateInstitutionSettingsDto } from './dto/create-institution-settings.dto';
import { UpdateInstitutionSettingsDto } from './dto/update-institution-settings.dto';

@Injectable()
export class InstitutionSettingsService {
  constructor(
    @InjectRepository(InstitutionSettings)
    private settingsRepository: Repository<InstitutionSettings>,
  ) {}

  async create(createDto: CreateInstitutionSettingsDto): Promise<InstitutionSettings> {
    const settings = this.settingsRepository.create(createDto);
    return this.settingsRepository.save(settings);
  }

  async findAll(): Promise<InstitutionSettings[]> {
    return this.settingsRepository.find();
  }

  async findOne(): Promise<InstitutionSettings> {
    const settings = await this.settingsRepository.findOne({ where: {} });
    if (!settings) {
      throw new NotFoundException('Configuración institucional no encontrada');
    }
    return settings;
  }

  async update(id: number, updateDto: UpdateInstitutionSettingsDto): Promise<InstitutionSettings> {
    const settings = await this.findOne();
    Object.assign(settings, updateDto);
    return this.settingsRepository.save(settings);
  }

  async upsert(createDto: CreateInstitutionSettingsDto): Promise<InstitutionSettings> {
    const existing = await this.settingsRepository.findOne({ where: {} });
    if (existing) {
      Object.assign(existing, createDto);
      return this.settingsRepository.save(existing);
    }
    return this.create(createDto);
  }

  async getPublicSettings(): Promise<Partial<InstitutionSettings>> {
    const settings = await this.findOne();
    let logoUrl = settings.logo_url;
    if (logoUrl && logoUrl.startsWith('http')) {
      const match = logoUrl.match(/\/sitbt-files\/(.+)$/);
      if (match) {
        logoUrl = `/storage/files/${match[1]}`;
      }
    }
    return {
      nombre: settings.nombre,
      nombre_corto: settings.nombre_corto,
      lema: settings.lema,
      logo_url: logoUrl,
      direccion: settings.direccion,
      telefono: settings.telefono,
      departamento: settings.departamento,
      email: settings.email,
      website: settings.website,
      ciudad: settings.ciudad,
      pais: settings.pais,
    };
  }
}
