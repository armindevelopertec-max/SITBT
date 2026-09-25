import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';

export interface UploadedFile {
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  url: string;
}

@Injectable()
export class StorageService {
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
    file: any,
    folder: string = 'general',
  ): Promise<UploadedFile> {
    try {
      const filename = `${folder}/${Date.now()}-${file.originalname}`;
      await this.minioClient.putObject(
        this.bucket,
        filename,
        file.buffer,
        file.size,
        { 'Content-Type': file.mimetype },
      );

      const url = await this.getFileUrl(filename);

      return {
        filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url,
      };
    } catch (error: any) {
      throw new InternalServerErrorException(`Failed to upload file: ${error.message}`);
    }
  }

  async uploadBuffer(
    buffer: Buffer,
    filename: string,
    mimetype: string,
    folder: string = 'general',
  ): Promise<UploadedFile> {
    try {
      const fullPath = `${folder}/${filename}`;
      await this.minioClient.putObject(
        this.bucket,
        fullPath,
        buffer,
        buffer.length,
        { 'Content-Type': mimetype },
      );

      const url = await this.getFileUrl(fullPath);

      return {
        filename: fullPath,
        originalname: filename,
        mimetype,
        size: buffer.length,
        url,
      };
    } catch (error: any) {
      throw new InternalServerErrorException(`Failed to upload file: ${error.message}`);
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
      throw new InternalServerErrorException(`Failed to get file URL: ${error.message}`);
    }
  }

  async deleteFile(filename: string): Promise<void> {
    try {
      await this.minioClient.removeObject(this.bucket, filename);
    } catch (error: any) {
      throw new InternalServerErrorException(`Failed to delete file: ${error.message}`);
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
      throw new InternalServerErrorException(`Failed to get file: ${error.message}`);
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
      throw new InternalServerErrorException(`Failed to list files: ${error.message}`);
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
}