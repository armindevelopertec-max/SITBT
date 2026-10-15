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
import { ServicioAlmacenamiento, ArchivoSubido as ArchivoSubidoType } from './almacenamiento.servicio';
import { GuardaJwt } from '../autenticacion/guarda-jwt';

@ApiTags('Almacenamiento')
@Controller('almacenamiento')
export class ControladorAlmacenamiento {
  private readonly registrador = new Logger(ControladorAlmacenamiento.name);
  constructor(private readonly servicio: ServicioAlmacenamiento) {}

  @Post('subir')
  @UseGuards(GuardaJwt)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('archivo'))
  async subirArchivo(
    @UploadedFile() archivo: any,
    @Query('carpeta') carpeta: string = 'general',
  ) {
    if (!archivo) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }
    return this.servicio.subirArchivo(archivo, carpeta);
  }

  @Get('archivos/*')
  async obtenerFlujoArchivo(
    @Param('0') nombreArchivo: string,
    @Res({ passthrough: true }) respuesta: Response,
  ) {
    this.registrador.log(`DEPURACIÓN: parámetro nombreArchivo = ${JSON.stringify(nombreArchivo)}`);
    try {
      const { flujo, tamano, tipoMime } = await this.servicio.obtenerFlujoArchivo(nombreArchivo);
      respuesta.set({
        'Content-Type': tipoMime,
        'Content-Length': tamano,
        'Content-Disposition': `inline; filename="${nombreArchivo}"`,
      });
      return new StreamableFile(flujo as any);
    } catch (error) {
      this.registrador.error(`Error al obtener el flujo del archivo: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get(':nombreArchivo')
  async obtenerArchivo(@Param('nombreArchivo') nombreArchivo: string) {
    const archivo = await this.servicio.obtenerArchivo(nombreArchivo);
    return { contenidoBase64: archivo.toString('base64') };
  }

  @Get(':nombreArchivo/url')
  @UseGuards(GuardaJwt)
  @ApiBearerAuth()
  async obtenerUrlArchivo(@Param('nombreArchivo') nombreArchivo: string) {
    const url = await this.servicio.obtenerUrlArchivo(nombreArchivo);
    return { url };
  }

  @Delete(':nombreArchivo')
  @UseGuards(GuardaJwt)
  @ApiBearerAuth()
  async eliminarArchivo(@Param('nombreArchivo') nombreArchivo: string) {
    await this.servicio.eliminarArchivo(nombreArchivo);
    return { mensaje: 'Archivo eliminado correctamente' };
  }

  @Get()
  @UseGuards(GuardaJwt)
  @ApiBearerAuth()
  async listarArchivos(@Query('prefijo') prefijo: string = '') {
    const archivos = await this.servicio.listarArchivos(prefijo);
    return { archivos };
  }
}
