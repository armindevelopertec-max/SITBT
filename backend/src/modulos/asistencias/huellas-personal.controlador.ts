import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ServicioAsistencias } from './asistencias.servicio';
import { CrearHuellaDto } from './dto/crear-huella.dto';
import { ActualizarHuellaDto } from './dto/actualizar-huella.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';
import { GuardaRoles } from '../autenticacion/guarda-roles';
import { Roles } from '../autenticacion/roles.decorador';

@ApiTags('Huellas del Personal')
@Controller('huellas-personal')
@UseGuards(GuardaJwt, GuardaRoles)
@Roles('administrador', 'secretaria', 'director_academico', 'rector', 'apoyo')
@ApiBearerAuth()
export class ControladorHuellasPersonal {
  constructor(private readonly servicioAsistencias: ServicioAsistencias) {}

  @Get()
  obtenerTodas() {
    return this.servicioAsistencias.obtenerHuellas();
  }

  @Get('personal/:personalId')
  obtenerPorPersonal(@Param('personalId', ParseIntPipe) personalId: number) {
    return this.servicioAsistencias.obtenerHuellasPorPersonal(personalId);
  }

  @Post()
  crear(@Body() dto: CrearHuellaDto) {
    return this.servicioAsistencias.crearHuella(dto);
  }

  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarHuellaDto,
  ) {
    return this.servicioAsistencias.actualizarHuella(id, dto);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.servicioAsistencias.eliminarHuella(id);
  }
}
