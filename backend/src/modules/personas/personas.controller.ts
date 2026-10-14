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
import { ServicioPersonas } from './personas.service';
import { CrearPersonaDto } from './dto/crear-persona.dto';
import { ActualizarPersonaDto } from './dto/actualizar-persona.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';
import { EstadoPersona } from '../../entities/persona.entity';

@ApiTags('Personas')
@Controller('personas')
export class ControladorPersonas {
  constructor(private readonly personsService: ServicioPersonas) {}

  @Post()
  create(@Body() crearPersonaDto: CrearPersonaDto) {
    return this.personsService.create(crearPersonaDto);
  }

  @Get()
  findAll(
    @Query('pagina') page = 1,
    @Query('limite') limit = 20,
    @Query('estado') status?: EstadoPersona,
  ) {
    return this.personsService.findAll(+page, +limit, status);
  }

  @Get('buscar')
  search(@Query('q') query: string, @Query('pagina') page = 1, @Query('limite') limit = 20) {
    return this.personsService.search(query, +page, +limit);
  }

  @Get('activos')
  findActive() {
    return this.personsService.findActive();
  }

  @Get('ci/:ci')
  findByCi(@Param('ci') ci: string) {
    return this.personsService.findByCi(ci);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.personsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(GuardaJwt)
  @ApiBearerAuth()
  update(@Param('id', ParseIntPipe) id: number, @Body() actualizarPersonaDto: ActualizarPersonaDto) {
    return this.personsService.update(id, actualizarPersonaDto);
  }

  @Delete(':id')
  @UseGuards(GuardaJwt)
  @ApiBearerAuth()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.personsService.remove(id);
  }
}