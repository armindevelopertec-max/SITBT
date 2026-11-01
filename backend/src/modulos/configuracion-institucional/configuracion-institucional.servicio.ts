import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfiguracionInstitucional } from '../../entidades/configuracion-institucional.entidad';
import { CrearConfiguracionInstitucionalDto } from './dto/crear-configuracion-institucional.dto';
import { ActualizarConfiguracionInstitucionalDto } from './dto/actualizar-configuracion-institucional.dto';

@Injectable()
export class ServicioConfiguracionInstitucional {
  constructor(
    @InjectRepository(ConfiguracionInstitucional)
    private repositorioConfiguracion: Repository<ConfiguracionInstitucional>,
  ) {}

  async crear(crearDto: CrearConfiguracionInstitucionalDto): Promise<ConfiguracionInstitucional> {
    const configuracion = this.repositorioConfiguracion.create(crearDto);
    return this.repositorioConfiguracion.save(configuracion);
  }

  async obtenerTodos(): Promise<ConfiguracionInstitucional[]> {
    return this.repositorioConfiguracion.find();
  }

  async obtenerUno(): Promise<ConfiguracionInstitucional> {
    const configuracion = await this.repositorioConfiguracion.findOne({ where: {} });
    if (!configuracion) {
      throw new NotFoundException('Configuración institucional no encontrada');
    }
    return configuracion;
  }

  async actualizar(id: number, actualizarDto: ActualizarConfiguracionInstitucionalDto): Promise<ConfiguracionInstitucional> {
    let configuracion = await this.repositorioConfiguracion.findOne({ where: {} });

    // Si aún no existe configuración (BD nueva), la creamos en vez de fallar con 404.
    if (!configuracion) {
      configuracion = this.repositorioConfiguracion.create({
        nombre: actualizarDto.nombre ?? 'Instituto Tecnológico Boliviana de Tecnología',
        nombreCorto: actualizarDto.nombreCorto ?? 'SITBT',
        pais: actualizarDto.pais ?? 'Bolivia',
      });
    }

    Object.assign(configuracion, actualizarDto);
    return this.repositorioConfiguracion.save(configuracion);
  }

  /**
   * Actualiza únicamente el logo institucional.
   *
   * Se usa desde la pantalla de configuración para guardar el logo en cuanto
   * termina la subida, sin tocar el resto de campos que el usuario todavía
   * puede tener sin guardar en el formulario.
   */
  async actualizarLogo(logoUrl: string): Promise<ConfiguracionInstitucional> {
    let configuracion = await this.repositorioConfiguracion.findOne({ where: {} });

    if (!configuracion) {
      configuracion = this.repositorioConfiguracion.create({
        nombre: 'Instituto Tecnológico Boliviana de Tecnología',
        nombreCorto: 'SITBT',
        pais: 'Bolivia',
      });
    }

    configuracion.logoUrl = logoUrl;
    return this.repositorioConfiguracion.save(configuracion);
  }

  async crearOActualizar(crearDto: CrearConfiguracionInstitucionalDto): Promise<ConfiguracionInstitucional> {
    const existente = await this.repositorioConfiguracion.findOne({ where: {} });
    if (existente) {
      Object.assign(existente, crearDto);
      return this.repositorioConfiguracion.save(existente);
    }
    return this.crear(crearDto);
  }

  async obtenerConfiguracionPublica(): Promise<Partial<ConfiguracionInstitucional>> {
    const configuracion = await this.repositorioConfiguracion.findOne({ where: {} });

    // Endpoint público: si todavía no hay configuración cargada, devolvemos
    // valores por defecto en lugar de un 404 (el frontend lo usa en cada página).
    if (!configuracion) {
      return {
        nombre: 'Instituto Tecnológico Boliviana de Tecnología',
        nombreCorto: 'SITBT',
        lema: '',
        logoUrl: '',
        direccion: '',
        telefono: '',
        departamento: '',
        correo: '',
        sitioWeb: '',
        ciudad: '',
        pais: 'Bolivia',
        descripcion: '',
      };
    }

    let urlLogo = configuracion.logoUrl;
    if (urlLogo && urlLogo.startsWith('http')) {
      const coincidencia = urlLogo.match(/\/sitbt-files\/(.+)$/);
      if (coincidencia) {
        urlLogo = `/api/almacenamiento/archivos/${coincidencia[1]}`;
      }
    }
    return {
      nombre: configuracion.nombre,
      nombreCorto: configuracion.nombreCorto,
      lema: configuracion.lema,
      logoUrl: urlLogo,
      direccion: configuracion.direccion,
      telefono: configuracion.telefono,
      departamento: configuracion.departamento,
      correo: configuracion.correo,
      sitioWeb: configuracion.sitioWeb,
      ciudad: configuracion.ciudad,
      pais: configuracion.pais,
      descripcion: configuracion.descripcion,
    };
  }
}
