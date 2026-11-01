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
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ServicioAdmision } from './admision.servicio';
import { CrearAdmisionDto } from './dto/crear-admision.dto';
import { ActualizarAdmisionDto } from './dto/actualizar-admision.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';
import { GuardaRoles } from '../autenticacion/guarda-roles';
import { Roles } from '../autenticacion/roles.decorador';
import { EstadoAdmision } from '../../entidades/solicitud-admision.entidad';

@ApiTags('Admision')
@Controller('admision')
export class ControladorAdmision {
  constructor(private readonly servicio: ServicioAdmision) {}

  @Post()
  crear(@Body() crearAdmisionDto: CrearAdmisionDto) {
    return this.servicio.crear(crearAdmisionDto);
  }

  @Get()
  @UseGuards(GuardaJwt, GuardaRoles)
  @Roles('administrador', 'secretaria')
  obtenerTodos(
    @Query('pagina') pagina = 1,
    @Query('limite') limite = 20,
    @Query('estado') estado?: EstadoAdmision,
    @Query('origen') origen?: string,
  ) {
    return this.servicio.obtenerTodos(+pagina, +limite, estado, origen);
  }

  @Get('estadisticas')
  @UseGuards(GuardaJwt, GuardaRoles)
  @Roles('administrador', 'secretaria')
  obtenerEstadisticas() {
    return this.servicio.obtenerEstadisticas();
  }

  @Get(':id')
  @UseGuards(GuardaJwt, GuardaRoles)
  @Roles('administrador', 'secretaria')
  obtenerUno(@Param('id') id: string) {
    return this.servicio.obtenerUno(id);
  }

  @Patch(':id')
  @UseGuards(GuardaJwt, GuardaRoles)
  @Roles('administrador', 'secretaria')
  actualizar(@Param('id') id: string, @Body() actualizarAdmisionDto: ActualizarAdmisionDto) {
    return this.servicio.actualizar(id, actualizarAdmisionDto);
  }

  @Post(':id/verificar')
  @UseGuards(GuardaJwt, GuardaRoles)
  @Roles('administrador', 'secretaria')
  @HttpCode(200)
  verificar(
    @Param('id') id: string,
    @Body('verificadoPor') verificadoPor: number,
    @Body('observaciones') observaciones?: string,
  ) {
    return this.servicio.verificar(id, verificadoPor, observaciones);
  }

  @Post(':id/rechazar')
  @UseGuards(GuardaJwt, GuardaRoles)
  @Roles('administrador', 'secretaria')
  @HttpCode(200)
  rechazar(
    @Param('id') id: string,
    @Body('verificadoPor') verificadoPor: number,
    @Body('observaciones') observaciones: string,
  ) {
    return this.servicio.rechazar(id, verificadoPor, observaciones);
  }

  @Post(':id/convertir-estudiante')
  @UseGuards(GuardaJwt, GuardaRoles)
  @Roles('administrador', 'secretaria')
  @HttpCode(200)
  convertirAEstudiante(
    @Param('id') id: string,
    @Body('gestionAdmision') gestionAdmision: string,
  ) {
    return this.servicio.convertirAEstudiante(id, gestionAdmision);
  }

  @Delete(':id')
  @UseGuards(GuardaJwt, GuardaRoles)
  @Roles('administrador', 'secretaria')
  eliminar(@Param('id') id: string) {
    return this.servicio.eliminar(id);
  }
}
