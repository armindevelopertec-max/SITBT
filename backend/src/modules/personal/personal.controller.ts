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
import { ServicioPersonal } from './personal.service';
import { CrearPersonalDto } from './dto/crear-personal.dto';
import { ActualizarPersonalDto } from './dto/actualizar-personal.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';
import { EstadoPersonal, CargoPersonal } from '../../entities/personal.entity';

@ApiTags('Personal')
@Controller('personal')
@UseGuards(GuardaJwt)
@ApiBearerAuth()
export class ControladorPersonal {
  constructor(private readonly servicioPersonal: ServicioPersonal) {}

  @Post()
  crear(@Body() crearPersonalDto: CrearPersonalDto) {
    return this.servicioPersonal.crear(crearPersonalDto);
  }

  @Get()
  obtenerTodos(
    @Query('pagina') pagina = 1,
    @Query('limite') limite = 20,
    @Query('estado') estado?: EstadoPersonal,
    @Query('cargo') cargo?: CargoPersonal,
  ) {
    return this.servicioPersonal.obtenerTodos(+pagina, +limite, estado, cargo);
  }

  @Get('activos')
  obtenerActivos() {
    return this.servicioPersonal.obtenerActivos();
  }

  @Get('docentes')
  obtenerDocentes() {
    return this.servicioPersonal.obtenerDocentes();
  }

  @Get('por-cargo/:cargo')
  buscarPorCargo(@Param('cargo') cargo: CargoPersonal) {
    return this.servicioPersonal.buscarPorCargo(cargo);
  }

  @Get(':id')
  obtenerUno(@Param('id', ParseIntPipe) id: number) {
    return this.servicioPersonal.obtenerUno(id);
  }

  @Patch(':id')
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() actualizarPersonalDto: ActualizarPersonalDto) {
    return this.servicioPersonal.actualizar(id, actualizarPersonalDto);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.servicioPersonal.eliminar(id);
  }
}
