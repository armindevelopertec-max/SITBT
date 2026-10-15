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
import { ServicioCarreras } from './carreras.servicio';
import { CrearCarreraDto } from './dto/crear-carrera.dto';
import { ActualizarCarreraDto } from './dto/actualizar-carrera.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';
import { EstadoCarrera } from '../../entidades/carrera.entidad';

@ApiTags('Carreras')
@Controller('carreras')
@ApiBearerAuth()
export class ControladorCarreras {
  constructor(private readonly servicioCarreras: ServicioCarreras) {}

  @Post()
  @UseGuards(GuardaJwt)
  crear(@Body() crearCarreraDto: CrearCarreraDto) {
    return this.servicioCarreras.crear(crearCarreraDto);
  }

  @Get()
  listar(@Query('pagina') pagina = 1, @Query('limite') limite = 20, @Query('estado') estado?: EstadoCarrera) {
    return this.servicioCarreras.obtenerTodos(+pagina, +limite, estado);
  }

  @Get('activos')
  listarActivas() {
    return this.servicioCarreras.obtenerActivos();
  }

  @Get('area/:area')
  buscarPorArea(@Param('area') area: string) {
    return this.servicioCarreras.buscarPorArea(area);
  }

  @Get('codigo/:codigo')
  buscarPorCodigo(@Param('codigo') codigo: string) {
    return this.servicioCarreras.buscarPorCodigo(codigo);
  }

  @Get(':id')
  obtenerUna(@Param('id', ParseIntPipe) id: number) {
    return this.servicioCarreras.obtenerUno(id);
  }

  @Patch(':id')
  @UseGuards(GuardaJwt)
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() actualizarCarreraDto: ActualizarCarreraDto) {
    return this.servicioCarreras.actualizar(id, actualizarCarreraDto);
  }

  @Delete(':id')
  @UseGuards(GuardaJwt)
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.servicioCarreras.eliminar(id);
  }
}