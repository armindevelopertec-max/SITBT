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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { StorageService, UploadedFile as UploadedFileType } from './storage.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Storage')
@Controller('storage')
export class StorageController {
  constructor(private readonly service: StorageService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
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

  @Get(':filename')
  async getFile(@Param('filename') filename: string) {
    const file = await this.service.getFile(filename);
    return { buffer: file.toString('base64') };
  }

  @Get('files/:filename')
  async getFileStream(
    @Param('filename') filename: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { stream, size, mimetype } = await this.service.getFileStream(filename);
    res.set({
      'Content-Type': mimetype,
      'Content-Length': size,
      'Content-Disposition': `inline; filename="${filename}"`,
    });
    return new StreamableFile(stream as any);
  }

  @Get(':filename/url')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getFileUrl(@Param('filename') filename: string) {
    const url = await this.service.getFileUrl(filename);
    return { url };
  }

  @Delete(':filename')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async deleteFile(@Param('filename') filename: string) {
    await this.service.deleteFile(filename);
    return { message: 'File deleted successfully' };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async listFiles(@Query('prefix') prefix: string = '') {
    const files = await this.service.listFiles(prefix);
    return { files };
  }
}