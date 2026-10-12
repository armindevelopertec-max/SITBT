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
import { ConsentService } from './consent.service';
import { CreateConsentDto } from './dto/create-consent.dto';
import { UpdateConsentDto } from './dto/update-consent.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';
import { ConsentType } from '../../entities/consent-record.entity';

@ApiTags('Consentimiento')
@Controller('consent')
@UseGuards(GuardaJwt)
@ApiBearerAuth()
export class ConsentController {
  constructor(private readonly service: ConsentService) {}

  @Post()
  create(@Body() createDto: CreateConsentDto) {
    return this.service.create(createDto);
  }

  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('estudianteId') estudianteId?: number,
  ) {
    return this.service.findAll(+page, +limit, estudianteId ? +estudianteId : undefined);
  }

  @Get('student/:estudianteId')
  findByStudent(@Param('estudianteId') estudianteId: string) {
    return this.service.findByStudent(+estudianteId);
  }

  @Get('student/:estudianteId/latest')
  getLatestConsent(@Param('estudianteId') estudianteId: string) {
    return this.service.getLatestConsent(+estudianteId);
  }

  @Get('check/:estudianteId/:version')
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
  update(@Param('id') id: string, @Body() updateDto: UpdateConsentDto) {
    return this.service.update(id, updateDto);
  }

  @Post(':id/exercise-right')
  @HttpCode(200)
  exerciseRight(
    @Param('id') id: string,
    @Body('derecho') derecho: ConsentType,
    @Body('registradoPor') registradoPor?: number,
  ) {
    return this.service.exerciseRight(id, derecho, registradoPor);
  }

  @Post(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
