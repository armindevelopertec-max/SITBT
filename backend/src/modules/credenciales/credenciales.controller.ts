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
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { ServicioCredenciales } from './credenciales.service';
import { CrearCredencialDto } from './dto/crear-credencial.dto';
import { ActualizarCredencialDto } from './dto/actualizar-credencial.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';
import { EstadoCredencial } from '../../entities/credencial.entity';

@ApiTags('Credenciales')
@Controller('credenciales')
@UseGuards(GuardaJwt)
@ApiBearerAuth()
export class ControladorCredenciales {
  constructor(private readonly service: ServicioCredenciales) {}

  @Post()
  create(@Body() createDto: CrearCredencialDto, @Req() req: Request) {
    const user = req.user as { id: number };
    createDto.emitidoPor = user.id;
    return this.service.create(createDto);
  }

  @Get()
  findAll(
    @Query('pagina') page = 1,
    @Query('limite') limit = 20,
    @Query('gestion') gestion?: string,
    @Query('semestre') semester?: string,
    @Query('estado') status?: EstadoCredencial,
  ) {
    return this.service.findAll(+page, +limit, gestion, semester ? +semester : undefined, status);
  }

  @Get('estudiante/:estudianteId')
  findByStudent(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.service.findByStudent(studentId);
  }

  @Get('estudiante/:estudianteId/gestion/:gestion')
  findByStudentAndGestion(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Param('gestion') gestion: string,
  ) {
    return this.service.findByStudentAndGestion(studentId, gestion);
  }

  @Get('estudiante/:estudianteId/activos')
  findActiveByStudent(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.service.findActiveByStudent(studentId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: ActualizarCredencialDto) {
    return this.service.update(id, updateDto);
  }

  @Patch(':id/marcar-impreso')
  markAsPrinted(@Param('id', ParseIntPipe) id: number) {
    return this.service.markAsPrinted(id);
  }

  @Patch(':id/anular')
  annul(@Param('id', ParseIntPipe) id: number) {
    return this.service.annul(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
