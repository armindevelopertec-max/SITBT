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
import { ServicioCarreras } from './carreras.service';
import { CrearCarreraDto } from './dto/crear-carrera.dto';
import { ActualizarCarreraDto } from './dto/actualizar-carrera.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';
import { EstadoCarrera } from '../../entities/carrera.entity';

@ApiTags('Carreras')
@Controller('carreras')
@ApiBearerAuth()
export class ControladorCarreras {
  constructor(private readonly servicioCarreras: ServicioCarreras) {}

  @Post()
  @UseGuards(GuardaJwt)
  crear(@Body() crearCarreraDto: CrearCarreraDto) {
    return this.servicioCarreras.create(crearCarreraDto);
  }

  @Get()
  listar(@Query('pagina') page = 1, @Query('limite') limit = 20, @Query('estado') estado?: EstadoCarrera) {
    return this.servicioCarreras.findAll(+page, +limit, estado);
  }

  @Get('activos')
  listarActivas() {
    return this.servicioCarreras.findActive();
  }

  @Get('area/:area')
  buscarPorArea(@Param('area') area: string) {
    return this.servicioCarreras.findByArea(area);
  }

  @Get('codigo/:codigo')
  buscarPorCodigo(@Param('codigo') code: string) {
    return this.servicioCarreras.findByCode(code);
  }

  @Get(':id')
  obtenerUna(@Param('id', ParseIntPipe) id: number) {
    return this.servicioCarreras.findOne(id);
  }

  @Patch(':id')
  @UseGuards(GuardaJwt)
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() actualizarCarreraDto: ActualizarCarreraDto) {
    return this.servicioCarreras.update(id, actualizarCarreraDto);
  }

  @Delete(':id')
  @UseGuards(GuardaJwt)
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.servicioCarreras.remove(id);
  }
}