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
import { ServicioMaterias } from './materias.service';
import { CrearMateriaDto } from './dto/crear-materia.dto';
import { ActualizarMateriaDto } from './dto/actualizar-materia.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';

@ApiTags('Materias')
@Controller('materias')
@UseGuards(GuardaJwt)
@ApiBearerAuth()
export class ControladorMaterias {
  constructor(private readonly subjectsService: ServicioMaterias) {}

  @Post()
  create(@Body() crearMateriaDto: CrearMateriaDto) {
    return this.subjectsService.create(crearMateriaDto);
  }

  @Get()
  findAll(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.subjectsService.findAll(+page, +limit);
  }

  @Get('all')
  findAllSubjects() {
    return this.subjectsService.findAllSubjects();
  }

  @Get('search')
  search(@Query('q') query: string) {
    return this.subjectsService.search(query);
  }

  @Get('code/:code')
  findByCodigo(@Param('code') code: string) {
    return this.subjectsService.findByCodigo(code);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.subjectsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() actualizarMateriaDto: ActualizarMateriaDto) {
    return this.subjectsService.update(id, actualizarMateriaDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.subjectsService.remove(id);
  }
}