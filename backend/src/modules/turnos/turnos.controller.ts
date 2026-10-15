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
import { ServicioTurnos } from './turnos.service';
import { CrearTurnoDto } from './dto/crear-turno.dto';
import { ActualizarTurnoDto } from './dto/actualizar-turno.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';

@ApiTags('Turnos')
@Controller('turnos')
@UseGuards(GuardaJwt)
@ApiBearerAuth()
export class ControladorTurnos {
  constructor(private readonly servicioTurnos: ServicioTurnos) {}

  @Post()
  crear(@Body() crearTurnoDto: CrearTurnoDto) {
    return this.servicioTurnos.crear(crearTurnoDto);
  }

  @Get()
  obtenerTodos(@Query('pagina') pagina = 1, @Query('limite') limite = 20) {
    return this.servicioTurnos.obtenerTodos(+pagina, +limite);
  }

  @Get('todos')
  obtenerTodosTurnos() {
    return this.servicioTurnos.obtenerTodosTurnos();
  }

  @Get('codigo/:codigo')
  buscarPorCodigo(@Param('codigo') codigo: string) {
    return this.servicioTurnos.buscarPorCodigo(codigo);
  }

  @Get(':id')
  obtenerUno(@Param('id', ParseIntPipe) id: number) {
    return this.servicioTurnos.obtenerUno(id);
  }

  @Patch(':id')
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() actualizarTurnoDto: ActualizarTurnoDto) {
    return this.servicioTurnos.actualizar(id, actualizarTurnoDto);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.servicioTurnos.eliminar(id);
  }
}
