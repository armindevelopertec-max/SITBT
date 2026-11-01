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
import { ServicioPersonas } from './personas.servicio';
import { CrearPersonaDto } from './dto/crear-persona.dto';
import { ActualizarPersonaDto } from './dto/actualizar-persona.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';
import { GuardaRoles } from '../autenticacion/guarda-roles';
import { Roles } from '../autenticacion/roles.decorador';
import { EstadoPersona } from '../../entidades/persona.entidad';

@ApiTags('Personas')
@Controller('personas')
@UseGuards(GuardaJwt, GuardaRoles)
@Roles('administrador', 'secretaria', 'director_academico')
@ApiBearerAuth()
export class ControladorPersonas {
  constructor(private readonly servicioPersonas: ServicioPersonas) {}

  @Post()
  crear(@Body() crearPersonaDto: CrearPersonaDto) {
    return this.servicioPersonas.crear(crearPersonaDto);
  }

  @Get()
  obtenerTodos(
    @Query('pagina') pagina = 1,
    @Query('limite') limite = 20,
    @Query('estado') estado?: EstadoPersona,
  ) {
    return this.servicioPersonas.obtenerTodos(+pagina, +limite, estado);
  }

  @Get('buscar')
  buscar(@Query('q') consulta: string, @Query('pagina') pagina = 1, @Query('limite') limite = 20) {
    return this.servicioPersonas.buscar(consulta, +pagina, +limite);
  }

  @Get('activos')
  obtenerActivos() {
    return this.servicioPersonas.obtenerActivos();
  }

  @Get('ci/:ci')
  buscarPorCi(@Param('ci') ci: string) {
    return this.servicioPersonas.buscarPorCi(ci);
  }

  @Get(':id')
  obtenerUno(@Param('id', ParseIntPipe) id: number) {
    return this.servicioPersonas.obtenerUno(id);
  }

  @Patch(':id')
  @UseGuards(GuardaJwt, GuardaRoles)
  @Roles('administrador', 'secretaria', 'director_academico')
  @ApiBearerAuth()
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() actualizarPersonaDto: ActualizarPersonaDto) {
    return this.servicioPersonas.actualizar(id, actualizarPersonaDto);
  }

  @Delete(':id')
  @UseGuards(GuardaJwt, GuardaRoles)
  @Roles('administrador', 'secretaria', 'director_academico')
  @ApiBearerAuth()
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.servicioPersonas.eliminar(id);
  }
}
