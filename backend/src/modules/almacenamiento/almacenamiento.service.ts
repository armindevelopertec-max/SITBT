import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';

export interface UploadedFile {
  nombreArchivo: string;
  nombreOriginal: string;
  tipoMime: string;
  tamano: number;
  url: string;
}

@Injectable()
export class ServicioAlmacenamiento {
  private minioClient: Client;
  private bucket: string;
  private useSSL: boolean;

  constructor(private configService: ConfigService) {
    this.bucket = this.configService.get('MINIO_BUCKET', 'sitbt-files');
    this.useSSL = this.configService.get('MINIO_USE_SSL', 'false') === 'true';

    const portStr = this.configService.get('MINIO_PORT', '9010');
    const port = parseInt(portStr, 10);

    this.minioClient = new Client({
      endPoint: this.configService.get('MINIO_ENDPOINT', 'localhost'),
      port: isNaN(port) ? 9010 : port,
      useSSL: this.useSSL,
      accessKey: this.configService.get('MINIO_ACCESS_KEY', 'minioadmin'),
      secretKey: this.configService.get('MINIO_SECRET_KEY', 'minioadmin'),
    });
  }

  async onModuleInit() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucket);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucket);
      }
      console.log('MinIO initialized successfully');
    } catch (error: any) {
      console.warn('MinIO initialization warning (non-critical):', error.message);
    }
  }

  async uploadFile(
    archivo: any,
    carpeta: string = 'general',
  ): Promise<UploadedFile> {
    try {
      const filename = `${carpeta}/${Date.now()}-${archivo.originalname}`;
      await this.minioClient.putObject(
        this.bucket,
        filename,
        archivo.buffer,
        archivo.size,
        { 'Content-Type': archivo.mimetype },
      );

      const url = `/api/almacenamiento/archivos/${filename}`;

      return {
        nombreArchivo: filename,
        nombreOriginal: archivo.originalname,
        tipoMime: archivo.mimetype,
        tamano: archivo.size,
        url,
      };
    } catch (error: any) {
      throw new InternalServerErrorException(`No se pudo subir el archivo: ${error.message}`);
    }
  }

  async uploadBuffer(
    buffer: Buffer,
    filename: string,
    mimetype: string,
    carpeta: string = 'general',
  ): Promise<UploadedFile> {
    try {
      const fullPath = `${carpeta}/${filename}`;
      await this.minioClient.putObject(
        this.bucket,
        fullPath,
        buffer,
        buffer.length,
        { 'Content-Type': mimetype },
      );

      const url = `/api/almacenamiento/archivos/${fullPath}`;

      return {
        nombreArchivo: fullPath,
        nombreOriginal: filename,
        tipoMime: mimetype,
        tamano: buffer.length,
        url,
      };
    } catch (error: any) {
      throw new InternalServerErrorException(`No se pudo subir el archivo: ${error.message}`);
    }
  }

  async getFileUrl(filename: string): Promise<string> {
    try {
      const endpoint = this.configService.get('MINIO_ENDPOINT', 'localhost');
      const port = this.configService.get('MINIO_PORT', 9000);
      const protocol = this.useSSL ? 'https' : 'http';

      if (this.configService.get('MINIO_EXTERNAL_URL')) {
        return `${this.configService.get('MINIO_EXTERNAL_URL')}/${filename}`;
      }

      return `${protocol}://${endpoint}:${port}/${this.bucket}/${filename}`;
    } catch (error: any) {
      throw new InternalServerErrorException(`No se pudo obtener la URL del archivo: ${error.message}`);
    }
  }

  async deleteFile(filename: string): Promise<void> {
    try {
      await this.minioClient.removeObject(this.bucket, filename);
    } catch (error: any) {
      throw new InternalServerErrorException(`No se pudo eliminar el archivo: ${error.message}`);
    }
  }

  async getFile(filename: string): Promise<Buffer> {
    try {
      const chunks: Buffer[] = [];
      const stream = await this.minioClient.getObject(this.bucket, filename);

      return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
      });
    } catch (error: any) {
      throw new InternalServerErrorException(`No se pudo obtener el archivo: ${error.message}`);
    }
  }

  async listFiles(prefix: string = ''): Promise<string[]> {
    try {
      const files: string[] = [];
      const stream = this.minioClient.listObjects(this.bucket, prefix, true);

      return new Promise((resolve, reject) => {
        stream.on('data', (obj) => {
          if (obj.name) files.push(obj.name);
        });
        stream.on('end', () => resolve(files));
        stream.on('error', reject);
      });
    } catch (error: any) {
      throw new InternalServerErrorException(`No se pudieron listar los archivos: ${error.message}`);
    }
  }

  async fileExists(filename: string): Promise<boolean> {
    try {
      await this.minioClient.statObject(this.bucket, filename);
      return true;
    } catch {
      return false;
    }
  }

  async getFileStream(filename: string): Promise<{ stream: NodeJS.ReadableStream; size: number; mimetype: string }> {
    try {
      const stat = await this.minioClient.statObject(this.bucket, filename);
      const stream = await this.minioClient.getObject(this.bucket, filename);
      return {
        stream,
        size: stat.size,
        mimetype: stat.metaData?.['content-type'] || 'application/octet-stream',
      };
    } catch (error: any) {
      throw new InternalServerErrorException(`No se pudo obtener el flujo del archivo: ${error.message}`);
    }
  }

  async getFileMetadata(filename: string): Promise<{ size: number; mimetype: string }> {
    try {
      const stat = await this.minioClient.statObject(this.bucket, filename);
      return {
        size: stat.size,
        mimetype: stat.metaData?.['content-type'] || 'application/octet-stream',
      };
    } catch (error: any) {
      throw new InternalServerErrorException(`No se pudo obtener los metadatos del archivo: ${error.message}`);
    }
  }
}