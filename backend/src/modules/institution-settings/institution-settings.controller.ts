import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InstitutionSettingsService } from './institution-settings.service';
import { CreateInstitutionSettingsDto } from './dto/create-institution-settings.dto';
import { UpdateInstitutionSettingsDto } from './dto/update-institution-settings.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Institution Settings')
@Controller('institution-settings')
export class InstitutionSettingsController {
  constructor(private readonly settingsService: InstitutionSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener configuración institucional (público)' })
  findAll() {
    return this.settingsService.findAll();
  }

  @Get('public')
  @ApiOperation({ summary: 'Obtener datos públicos de la institución' })
  getPublicSettings() {
    return this.settingsService.getPublicSettings();
  }

  @Get('single')
  @ApiOperation({ summary: 'Obtener configuración única' })
  findOne() {
    return this.settingsService.findOne();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear configuración institucional' })
  create(@Body() createDto: CreateInstitutionSettingsDto) {
    return this.settingsService.upsert(createDto);
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar configuración institucional' })
  update(@Body() updateDto: UpdateInstitutionSettingsDto) {
    return this.settingsService.update(1, updateDto);
  }
}
