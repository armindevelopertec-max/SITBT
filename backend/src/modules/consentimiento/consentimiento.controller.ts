import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ServicioConsentimiento } from './consentimiento.service';
import { CrearConsentimientoDto } from './dto/crear-consentimiento.dto';
import { ActualizarConsentimientoDto } from './dto/actualizar-consentimiento.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';
import { TipoConsentimiento } from '../../entities/consent-record.entity';

@ApiTags('Consentimiento')
@Controller('consentimiento')
@UseGuards(GuardaJwt)
@ApiBearerAuth()
export class ControladorConsentimiento {
  constructor(private readonly service: ServicioConsentimiento) {}

  @Post()
  create(@Body() createDto: CrearConsentimientoDto) {
    return this.service.create(createDto);
  }

  @Get()
  findAll(
    @Query('pagina') page = 1,
    @Query('limite') limit = 20,
    @Query('estudianteId') estudianteId?: number,
  ) {
    return this.service.findAll(+page, +limit, estudianteId ? +estudianteId : undefined);
  }

  @Get('estudiante/:estudianteId')
  findByStudent(@Param('estudianteId') estudianteId: string) {
    return this.service.findByStudent(+estudianteId);
  }

  @Get('estudiante/:estudianteId/ultimo')
  getLatestConsent(@Param('estudianteId') estudianteId: string) {
    return this.service.getLatestConsent(+estudianteId);
  }

  @Get('verificar/:estudianteId/:version')
  checkValidConsent(
    @Param('estudianteId') estudianteId: string,
    @Param('version') version: string,
  ) {
    return this.service.hasValidConsent(+estudianteId, version);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: ActualizarConsentimientoDto) {
    return this.service.update(id, updateDto);
  }

  @Post(':id/ejercer-derecho')
  @HttpCode(200)
  exerciseRight(
    @Param('id') id: string,
    @Body('derecho') derecho: TipoConsentimiento,
    @Body('registradoPor') registradoPor?: number,
  ) {
    return this.service.exerciseRight(id, derecho, registradoPor);
  }

  @Post(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
