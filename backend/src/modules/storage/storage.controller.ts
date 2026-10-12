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
import { StorageService, UploadedFile as UploadedFileType } from './storage.service';
import { GuardaJwt } from '../autenticacion/guarda-jwt';

@ApiTags('Storage')
@Controller('storage')
export class StorageController {
  private readonly logger = new Logger(StorageController.name);
  constructor(private readonly service: StorageService) {}

  @Post('upload')
  @UseGuards(GuardaJwt)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: any,
    @Query('folder') folder: string = 'general',
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    return this.service.uploadFile(file, folder);
  }

  @Get('files/*')
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

  @Get(':filename')
  async getFile(@Param('filename') filename: string) {
    const file = await this.service.getFile(filename);
    return { buffer: file.toString('base64') };
  }

  @Get(':filename/url')
  @UseGuards(GuardaJwt)
  @ApiBearerAuth()
  async getFileUrl(@Param('filename') filename: string) {
    const url = await this.service.getFileUrl(filename);
    return { url };
  }

  @Delete(':filename')
  @UseGuards(GuardaJwt)
  @ApiBearerAuth()
  async deleteFile(@Param('filename') filename: string) {
    await this.service.deleteFile(filename);
    return { message: 'File deleted successfully' };
  }

  @Get()
  @UseGuards(GuardaJwt)
  @ApiBearerAuth()
  async listFiles(@Query('prefix') prefix: string = '') {
    const files = await this.service.listFiles(prefix);
    return { files };
  }
}