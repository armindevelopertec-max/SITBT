import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GuardaJwt } from '../autenticacion/guarda-jwt';
import { GuardaRoles } from '../autenticacion/guarda-roles';
import { Roles } from '../autenticacion/roles.decorador';
import { ActualizarPermisosDto } from './dto/actualizar-permisos.dto';
import { ServicioPermisos } from './permisos.servicio';

@ApiTags('Permisos')
@Controller('permisos')
@UseGuards(GuardaJwt, GuardaRoles)
@Roles('administrador')
@ApiBearerAuth()
export class ControladorPermisos {
  constructor(private readonly servicioPermisos: ServicioPermisos) {}

  @Get('catalogo')
  obtenerCatalogo() {
    return this.servicioPermisos.obtenerCatalogo();
  }

  @Get('rol/:rolId')
  obtenerPorRol(@Param('rolId', ParseIntPipe) rolId: number) {
    return this.servicioPermisos.obtenerPorRol(rolId);
  }

  @Put('rol/:rolId')
  actualizarPorRol(
    @Param('rolId', ParseIntPipe) rolId: number,
    @Body() datos: ActualizarPermisosDto,
  ) {
    return this.servicioPermisos.actualizarPorRol(rolId, datos);
  }
}
