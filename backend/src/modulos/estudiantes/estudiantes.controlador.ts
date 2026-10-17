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
import { ServicioEstudiantes } from './estudiantes.servicio';
import { CrearEstudianteDto } from './dto/crear-estudiante.dto';
import { ActualizarEstudianteDto } from './dto/actualizar-estudiante.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';
import { EstadoEstudiante } from '../../entidades/estudiante.entidad';

@ApiTags('Estudiantes')
@Controller('estudiantes')
@UseGuards(GuardaJwt)
@ApiBearerAuth()
export class ControladorEstudiantes {
  constructor(private readonly servicioEstudiantes: ServicioEstudiantes) {}

  @Post()
  crear(@Body() crearEstudianteDto: CrearEstudianteDto) {
    return this.servicioEstudiantes.crear(crearEstudianteDto);
  }

  @Get()
  obtenerTodos(
    @Query('pagina') pagina = 1,
    @Query('limite') limite = 20,
    @Query('estado') estado?: EstadoEstudiante,
    @Query('carreraId') carreraId?: number,
    @Query('buscar') buscar?: string,
  ) {
    return this.servicioEstudiantes.obtenerTodos(
      +pagina,
      +limite,
      estado,
      carreraId ? +carreraId : undefined,
      buscar,
    );
  }

  @Get('estadisticas')
  obtenerEstadisticas() {
    return this.servicioEstudiantes.obtenerEstadisticasEstudiante();
  }

  @Get('por-carrera/:carreraId')
  buscarPorCarrera(@Param('carreraId', ParseIntPipe) carreraId: number, @Query('gestion') gestion?: string) {
    return this.servicioEstudiantes.buscarPorCarrera(carreraId, gestion);
  }

  @Get('activos')
  buscarActivos() {
    return this.servicioEstudiantes.buscarActivos();
  }

  @Get('conteo-por-estado')
  contarPorEstado(@Query('carreraId') carreraId?: number) {
    return this.servicioEstudiantes.contarPorEstado(carreraId ? +carreraId : undefined);
  }

  @Get('inscripcion/:codigo')
  buscarPorCodigoInscripcion(@Param('codigo') codigo: string) {
    return this.servicioEstudiantes.buscarPorCodigoInscripcion(codigo);
  }

  @Get(':id')
  obtenerUno(@Param('id', ParseIntPipe) id: number) {
    return this.servicioEstudiantes.obtenerUno(id);
  }

  @Patch(':id')
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() actualizarEstudianteDto: ActualizarEstudianteDto) {
    return this.servicioEstudiantes.actualizar(id, actualizarEstudianteDto);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.servicioEstudiantes.eliminar(id);
  }
}
