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
import { ServicioMaterias } from './materias.servicio';
import { CrearMateriaDto } from './dto/crear-materia.dto';
import { ActualizarMateriaDto } from './dto/actualizar-materia.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';
import { GuardaRoles } from '../autenticacion/guarda-roles';
import { Roles } from '../autenticacion/roles.decorador';

@ApiTags('Materias')
@Controller('materias')
@UseGuards(GuardaJwt, GuardaRoles)
@Roles('administrador', 'secretaria', 'director_academico', 'rector', 'docente')
@ApiBearerAuth()
export class ControladorMaterias {
  constructor(private readonly servicioMaterias: ServicioMaterias) {}

  @Post()
  @Roles('administrador', 'director_academico')
  crear(@Body() crearMateriaDto: CrearMateriaDto) {
    return this.servicioMaterias.crear(crearMateriaDto);
  }

  @Get()
  obtenerTodos(@Query('pagina') pagina = 1, @Query('limite') limite = 20) {
    return this.servicioMaterias.obtenerTodos(+pagina, +limite);
  }

  @Get('todos')
  obtenerTodosMaterias() {
    return this.servicioMaterias.obtenerTodosMaterias();
  }

  @Get('buscar')
  buscar(@Query('q') consulta: string) {
    return this.servicioMaterias.buscar(consulta);
  }

  @Get('codigo/:codigo')
  buscarPorCodigo(@Param('codigo') codigo: string) {
    return this.servicioMaterias.buscarPorCodigo(codigo);
  }

  @Get(':id')
  obtenerUno(@Param('id', ParseIntPipe) id: number) {
    return this.servicioMaterias.obtenerUno(id);
  }

  @Patch(':id')
  @Roles('administrador', 'director_academico')
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() actualizarMateriaDto: ActualizarMateriaDto) {
    return this.servicioMaterias.actualizar(id, actualizarMateriaDto);
  }

  @Delete(':id')
  @Roles('administrador', 'director_academico')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.servicioMaterias.eliminar(id);
  }
}
