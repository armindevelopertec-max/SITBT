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
import { ServicioGestiones } from './gestiones.servicio';
import { CrearGestionDto } from './dto/crear-gestion.dto';
import { ActualizarGestionDto } from './dto/actualizar-gestion.dto';
import { CrearPeriodoDto, ActualizarPeriodoDto } from './dto/periodo.dto';
import { EstadoGestion } from '../../entidades/enumeraciones/estado-gestion.enumeracion';
import { GuardaJwt } from '../autenticacion/guarda-jwt';
import { GuardaRoles } from '../autenticacion/guarda-roles';
import { Roles } from '../autenticacion/roles.decorador';

@ApiTags('Gestiones')
@Controller('gestiones')
export class ControladorGestiones {
  constructor(private readonly servicioGestiones: ServicioGestiones) {}

  @Post()
  @UseGuards(GuardaJwt, GuardaRoles)
  @Roles('administrador')
  @ApiBearerAuth()
  crear(@Body() crearGestionDto: CrearGestionDto) {
    return this.servicioGestiones.crear(crearGestionDto);
  }

  @Get()
  obtenerTodos(
    @Query('pagina') pagina = 1,
    @Query('limite') limite = 20,
    @Query('estado') estado?: EstadoGestion,
  ) {
    return this.servicioGestiones.obtenerTodos(+pagina, +limite, estado);
  }

  @Get('activos')
  obtenerActivos() {
    return this.servicioGestiones.obtenerActivos();
  }

  @Get('actual')
  obtenerActual() {
    return this.servicioGestiones.obtenerActual();
  }

  @Get('anio/:anio')
  buscarPorAnio(@Param('anio') anio: string) {
    return this.servicioGestiones.buscarPorAnio(anio);
  }

  @Get(':id')
  obtenerUno(@Param('id', ParseIntPipe) id: number) {
    return this.servicioGestiones.obtenerUno(id);
  }

  @Patch(':id')
  @UseGuards(GuardaJwt, GuardaRoles)
  @Roles('administrador')
  @ApiBearerAuth()
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() actualizarGestionDto: ActualizarGestionDto,
  ) {
    return this.servicioGestiones.actualizar(id, actualizarGestionDto);
  }

  @Post(':id/abrir')
  @UseGuards(GuardaJwt, GuardaRoles)
  @Roles('administrador')
  @ApiBearerAuth()
  abrir(@Param('id', ParseIntPipe) id: number) {
    return this.servicioGestiones.abrir(id);
  }

  @Post(':id/cerrar')
  @UseGuards(GuardaJwt, GuardaRoles)
  @Roles('administrador')
  @ApiBearerAuth()
  cerrar(@Param('id', ParseIntPipe) id: number) {
    return this.servicioGestiones.cerrar(id);
  }

  @Post(':id/establecer-actual')
  @UseGuards(GuardaJwt, GuardaRoles)
  @Roles('administrador')
  @ApiBearerAuth()
  establecerActual(@Param('id', ParseIntPipe) id: number) {
    return this.servicioGestiones.establecerActual(id);
  }

  @Delete(':id')
  @UseGuards(GuardaJwt, GuardaRoles)
  @Roles('administrador')
  @ApiBearerAuth()
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.servicioGestiones.eliminar(id);
  }

  @Post(':gestionId/periodos')
  @UseGuards(GuardaJwt, GuardaRoles)
  @Roles('administrador')
  @ApiBearerAuth()
  crearPeriodo(
    @Param('gestionId', ParseIntPipe) gestionId: number,
    @Body() crearPeriodoDto: CrearPeriodoDto,
  ) {
    return this.servicioGestiones.crearPeriodo(gestionId, crearPeriodoDto);
  }

  @Patch('periodos/:periodoId')
  @UseGuards(GuardaJwt, GuardaRoles)
  @Roles('administrador')
  @ApiBearerAuth()
  actualizarPeriodo(
    @Param('periodoId', ParseIntPipe) periodoId: number,
    @Body() actualizarPeriodoDto: ActualizarPeriodoDto,
  ) {
    return this.servicioGestiones.actualizarPeriodo(periodoId, actualizarPeriodoDto);
  }

  @Delete('periodos/:periodoId')
  @UseGuards(GuardaJwt, GuardaRoles)
  @Roles('administrador')
  @ApiBearerAuth()
  eliminarPeriodo(@Param('periodoId', ParseIntPipe) periodoId: number) {
    return this.servicioGestiones.eliminarPeriodo(periodoId);
  }

  @Post('periodos/:periodoId/abrir')
  @UseGuards(GuardaJwt, GuardaRoles)
  @Roles('administrador')
  @ApiBearerAuth()
  abrirPeriodo(@Param('periodoId', ParseIntPipe) periodoId: number) {
    return this.servicioGestiones.abrirPeriodo(periodoId);
  }

  @Post('periodos/:periodoId/cerrar')
  @UseGuards(GuardaJwt, GuardaRoles)
  @Roles('administrador')
  @ApiBearerAuth()
  cerrarPeriodo(@Param('periodoId', ParseIntPipe) periodoId: number) {
    return this.servicioGestiones.cerrarPeriodo(periodoId);
  }
}
