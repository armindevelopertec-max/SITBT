import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
  StreamableFile,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { ServicioAlmacenamiento, UploadedFile as UploadedFileType } from './almacenamiento.service';
import { GuardaJwt } from '../autenticacion/guarda-jwt';

@ApiTags('Almacenamiento')
@Controller('almacenamiento')
export class ControladorAlmacenamiento {
  private readonly logger = new Logger(ControladorAlmacenamiento.name);
  constructor(private readonly service: ServicioAlmacenamiento) {}

  @Post('subir')
  @UseGuards(GuardaJwt)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('archivo'))
  async uploadFile(
    @UploadedFile() archivo: any,
    @Query('carpeta') carpeta: string = 'general',
  ) {
    if (!archivo) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }
    return this.service.uploadFile(archivo, carpeta);
  }

  @Get('archivos/*')
  async getFileStream(
    @Param('0') filename: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    this.logger.log(`DEBUG: filename param = ${JSON.stringify(filename)}`);
    try {
      const { stream, size, mimetype } = await this.service.getFileStream(filename);
      res.set({
        'Content-Type': mimetype,
        'Content-Length': size,
        'Content-Disposition': `inline; filename="${filename}"`,
      });
      return new StreamableFile(stream as any);
    } catch (error) {
      this.logger.error(`Error getting file stream: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get(':nombreArchivo')
  async getFile(@Param('nombreArchivo') filename: string) {
    const file = await this.service.getFile(filename);
    return { contenidoBase64: file.toString('base64') };
  }

  @Get(':nombreArchivo/url')
  @UseGuards(GuardaJwt)
  @ApiBearerAuth()
  async getFileUrl(@Param('nombreArchivo') filename: string) {
    const url = await this.service.getFileUrl(filename);
    return { url };
  }

  @Delete(':nombreArchivo')
  @UseGuards(GuardaJwt)
  @ApiBearerAuth()
  async deleteFile(@Param('nombreArchivo') filename: string) {
    await this.service.deleteFile(filename);
    return { mensaje: 'Archivo eliminado correctamente' };
  }

  @Get()
  @UseGuards(GuardaJwt)
  @ApiBearerAuth()
  async listFiles(@Query('prefijo') prefix: string = '') {
    const files = await this.service.listFiles(prefix);
    return { archivos: files };
  }
}