import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';
import { ServicioOptimizacionImagen } from './servicio-optimizacion-imagen';

export interface ArchivoSubido {
  nombreArchivo: string;
  nombreOriginal: string;
  tipoMime: string;
  tamano: number;
  url: string;
}

@Injectable()
export class ServicioAlmacenamiento {
  private clienteMinio: Client;
  private bucket: string;
  private usarSSL: boolean;

  constructor(
    private servicioConfiguracion: ConfigService,
    private servicioOptimizacion: ServicioOptimizacionImagen,
  ) {
    this.bucket = this.servicioConfiguracion.get('MINIO_BUCKET', 'sitbt-files');
    this.usarSSL = this.servicioConfiguracion.get('MINIO_USE_SSL', 'false') === 'true';

    const puertoTexto = this.servicioConfiguracion.get('MINIO_PORT', '9010');
    const puerto = parseInt(puertoTexto, 10);

    this.clienteMinio = new Client({
      endPoint: this.servicioConfiguracion.get('MINIO_ENDPOINT', 'localhost'),
      port: isNaN(puerto) ? 9010 : puerto,
      useSSL: this.usarSSL,
      accessKey: this.servicioConfiguracion.get('MINIO_ACCESS_KEY', 'minioadmin'),
      secretKey: this.servicioConfiguracion.get('MINIO_SECRET_KEY', 'minioadmin'),
    });
  }

  async onModuleInit() {
    try {
      const existe = await this.clienteMinio.bucketExists(this.bucket);
      if (!existe) {
        await this.clienteMinio.makeBucket(this.bucket);
      }
      console.log('MinIO inicializado correctamente');
    } catch (error: any) {
      console.warn('Advertencia de inicialización de MinIO (no crítica):', error.message);
    }
  }

  async subirArchivo(
    archivo: any,
    carpeta: string = 'general',
  ): Promise<ArchivoSubido> {
    try {
      const optimizada = await this.servicioOptimizacion.optimizar(
        archivo.buffer,
        archivo.mimetype,
        carpeta,
      );

      const nombreArchivo = `${carpeta}/${Date.now()}-${this.nombreSinExtension(
        archivo.originalname,
      )}.${optimizada.extension}`;

      await this.clienteMinio.putObject(
        this.bucket,
        nombreArchivo,
        optimizada.buffer,
        optimizada.buffer.length,
        { 'Content-Type': optimizada.tipoMime },
      );

      const url = `/api/almacenamiento/archivos/${nombreArchivo}`;

      if (optimizada.pesoOptimizado < optimizada.pesoOriginal) {
        console.log(
          `Imagen optimizada ${nombreArchivo}: ${(optimizada.pesoOriginal / 1024).toFixed(1)} KB -> ${(optimizada.pesoOptimizado / 1024).toFixed(1)} KB`,
        );
      }

      return {
        nombreArchivo,
        nombreOriginal: archivo.originalname,
        tipoMime: optimizada.tipoMime,
        tamano: optimizada.buffer.length,
        url,
      };
    } catch (error: any) {
      throw new InternalServerErrorException(`No se pudo subir el archivo: ${error.message}`);
    }
  }

  /** Quita la extensión del nombre original del archivo. */
  private nombreSinExtension(nombre: string): string {
    const punto = nombre.lastIndexOf('.');
    return punto > 0 ? nombre.slice(0, punto) : nombre;
  }

  async subirBuffer(
    buffer: Buffer,
    nombreArchivo: string,
    tipoMime: string,
    carpeta: string = 'general',
  ): Promise<ArchivoSubido> {
    try {
      const optimizada = await this.servicioOptimizacion.optimizar(
        buffer,
        tipoMime,
        carpeta,
      );

      const rutaCompleta = `${carpeta}/${this.nombreSinExtension(
        nombreArchivo,
      )}.${optimizada.extension}`;

      await this.clienteMinio.putObject(
        this.bucket,
        rutaCompleta,
        optimizada.buffer,
        optimizada.buffer.length,
        { 'Content-Type': optimizada.tipoMime },
      );

      const url = `/api/almacenamiento/archivos/${rutaCompleta}`;

      if (optimizada.pesoOptimizado < optimizada.pesoOriginal) {
        console.log(
          `Imagen optimizada ${rutaCompleta}: ${(optimizada.pesoOriginal / 1024).toFixed(1)} KB -> ${(optimizada.pesoOptimizado / 1024).toFixed(1)} KB`,
        );
      }

      return {
        nombreArchivo: rutaCompleta,
        nombreOriginal: nombreArchivo,
        tipoMime: optimizada.tipoMime,
        tamano: optimizada.buffer.length,
        url,
      };
    } catch (error: any) {
      throw new InternalServerErrorException(`No se pudo subir el archivo: ${error.message}`);
    }
  }

  async obtenerUrlArchivo(nombreArchivo: string): Promise<string> {
    try {
      const puntoFinal = this.servicioConfiguracion.get('MINIO_ENDPOINT', 'localhost');
      const puerto = this.servicioConfiguracion.get('MINIO_PORT', 9000);
      const protocolo = this.usarSSL ? 'https' : 'http';

      if (this.servicioConfiguracion.get('MINIO_EXTERNAL_URL')) {
        return `${this.servicioConfiguracion.get('MINIO_EXTERNAL_URL')}/${nombreArchivo}`;
      }

      return `${protocolo}://${puntoFinal}:${puerto}/${this.bucket}/${nombreArchivo}`;
    } catch (error: any) {
      throw new InternalServerErrorException(`No se pudo obtener la URL del archivo: ${error.message}`);
    }
  }

  async eliminarArchivo(nombreArchivo: string): Promise<void> {
    try {
      await this.clienteMinio.removeObject(this.bucket, nombreArchivo);
    } catch (error: any) {
      throw new InternalServerErrorException(`No se pudo eliminar el archivo: ${error.message}`);
    }
  }

  async obtenerArchivo(nombreArchivo: string): Promise<Buffer> {
    try {
      const fragmentos: Buffer[] = [];
      const flujo = await this.clienteMinio.getObject(this.bucket, nombreArchivo);

      return new Promise((resolve, reject) => {
        flujo.on('data', (fragmento) => fragmentos.push(fragmento));
        flujo.on('end', () => resolve(Buffer.concat(fragmentos)));
        flujo.on('error', reject);
      });
    } catch (error: any) {
      throw new InternalServerErrorException(`No se pudo obtener el archivo: ${error.message}`);
    }
  }

  async listarArchivos(prefijo: string = ''): Promise<string[]> {
    try {
      const archivos: string[] = [];
      const flujo = this.clienteMinio.listObjects(this.bucket, prefijo, true);

      return new Promise((resolve, reject) => {
        flujo.on('data', (objeto) => {
          if (objeto.name) archivos.push(objeto.name);
        });
        flujo.on('end', () => resolve(archivos));
        flujo.on('error', reject);
      });
    } catch (error: any) {
      throw new InternalServerErrorException(`No se pudieron listar los archivos: ${error.message}`);
    }
  }

  async existeArchivo(nombreArchivo: string): Promise<boolean> {
    try {
      await this.clienteMinio.statObject(this.bucket, nombreArchivo);
      return true;
    } catch {
      return false;
    }
  }

  async obtenerFlujoArchivo(nombreArchivo: string): Promise<{ flujo: NodeJS.ReadableStream; tamano: number; tipoMime: string }> {
    try {
      const estadistica = await this.clienteMinio.statObject(this.bucket, nombreArchivo);
      const flujo = await this.clienteMinio.getObject(this.bucket, nombreArchivo);
      return {
        flujo,
        tamano: estadistica.size,
        tipoMime: estadistica.metaData?.['content-type'] || 'application/octet-stream',
      };
    } catch (error: any) {
      throw new InternalServerErrorException(`No se pudo obtener el flujo del archivo: ${error.message}`);
    }
  }

  async obtenerMetadatosArchivo(nombreArchivo: string): Promise<{ tamano: number; tipoMime: string }> {
    try {
      const estadistica = await this.clienteMinio.statObject(this.bucket, nombreArchivo);
      return {
        tamano: estadistica.size,
        tipoMime: estadistica.metaData?.['content-type'] || 'application/octet-stream',
      };
    } catch (error: any) {
      throw new InternalServerErrorException(`No se pudo obtener los metadatos del archivo: ${error.message}`);
    }
  }
}
