import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ServicioCertificados } from './certificados.service';
import { CrearCertificadoDto } from './dto/crear-certificado.dto';
import { ActualizarCertificadoDto } from './dto/actualizar-certificado.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';

@ApiTags('Certificados')
@Controller('certificados')
export class ControladorCertificados {
  constructor(private readonly service: ServicioCertificados) {}

  @Post()
  @UseGuards(GuardaJwt)
  @ApiBearerAuth()
  create(@Body() createDto: CrearCertificadoDto) {
    return this.service.create(createDto);
  }

  @Get()
  findAll(
    @Query('pagina') page = 1,
    @Query('limite') limit = 20,
    @Query('gestion') gestion?: string,
    @Query('tipo') type?: string,
    @Query('estudianteId') studentId?: number,
  ) {
    return this.service.findAll(+page, +limit, gestion, type, studentId ? +studentId : undefined);
  }

  @Get('estudiante/:estudianteId')
  findByStudent(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.service.findByStudent(studentId);
  }

  @Get('verificar/:codigo')
  verifyCertificate(@Param('codigo') code: string) {
    return this.service.verifyCertificate(code);
  }

  @Get('codigo/:codigo')
  findByCode(@Param('codigo') code: string) {
    return this.service.findByCode(code);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @UseGuards(GuardaJwt)
  @ApiBearerAuth()
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: ActualizarCertificadoDto) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(GuardaJwt)
  @ApiBearerAuth()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}