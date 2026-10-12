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
  constructor(private readonly shiftsService: ServicioTurnos) {}

  @Post()
  create(@Body() crearTurnoDto: CrearTurnoDto) {
    return this.shiftsService.create(crearTurnoDto);
  }

  @Get()
  findAll(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.shiftsService.findAll(+page, +limit);
  }

  @Get('all')
  findAllTurnos() {
    return this.shiftsService.findAllTurnos();
  }

  @Get('codigo/:codigo')
  findByCodigo(@Param('codigo') codigo: string) {
    return this.shiftsService.findByCodigo(codigo);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.shiftsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() actualizarTurnoDto: ActualizarTurnoDto) {
    return this.shiftsService.update(id, actualizarTurnoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.shiftsService.remove(id);
  }
}