import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfiguracionInstitucional } from '../../entities/institution-settings.entity';
import { CrearConfiguracionInstitucionalDto } from './dto/crear-configuracion-institucional.dto';
import { ActualizarConfiguracionInstitucionalDto } from './dto/actualizar-configuracion-institucional.dto';

@Injectable()
export class ServicioConfiguracionInstitucional {
  constructor(
    @InjectRepository(ConfiguracionInstitucional)
    private settingsRepository: Repository<ConfiguracionInstitucional>,
  ) {}

  async create(createDto: CrearConfiguracionInstitucionalDto): Promise<ConfiguracionInstitucional> {
    const settings = this.settingsRepository.create(createDto);
    return this.settingsRepository.save(settings);
  }

  async findAll(): Promise<ConfiguracionInstitucional[]> {
    return this.settingsRepository.find();
  }

  async findOne(): Promise<ConfiguracionInstitucional> {
    const settings = await this.settingsRepository.findOne({ where: {} });
    if (!settings) {
      throw new NotFoundException('Configuración institucional no encontrada');
    }
    return settings;
  }

  async update(id: number, updateDto: ActualizarConfiguracionInstitucionalDto): Promise<ConfiguracionInstitucional> {
    const settings = await this.findOne();
    Object.assign(settings, updateDto);
    return this.settingsRepository.save(settings);
  }

  async upsert(createDto: CrearConfiguracionInstitucionalDto): Promise<ConfiguracionInstitucional> {
    const existing = await this.settingsRepository.findOne({ where: {} });
    if (existing) {
      Object.assign(existing, createDto);
      return this.settingsRepository.save(existing);
    }
    return this.create(createDto);
  }

  async getPublicSettings(): Promise<Partial<ConfiguracionInstitucional>> {
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
