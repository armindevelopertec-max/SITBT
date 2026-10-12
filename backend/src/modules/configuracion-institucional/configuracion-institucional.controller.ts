import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ServicioConfiguracionInstitucional } from './configuracion-institucional.service';
import { CrearConfiguracionInstitucionalDto } from './dto/crear-configuracion-institucional.dto';
import { ActualizarConfiguracionInstitucionalDto } from './dto/actualizar-configuracion-institucional.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';

@ApiTags('Institution Settings')
@Controller('configuracion-institucional')
export class ControladorConfiguracionInstitucional {
  constructor(private readonly settingsService: ServicioConfiguracionInstitucional) {}

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
  @UseGuards(GuardaJwt)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear configuración institucional' })
  create(@Body() createDto: CrearConfiguracionInstitucionalDto) {
    return this.settingsService.upsert(createDto);
  }

  @Put()
  @UseGuards(GuardaJwt)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar configuración institucional' })
  update(@Body() updateDto: ActualizarConfiguracionInstitucionalDto) {
    return this.settingsService.update(1, updateDto);
  }
}
