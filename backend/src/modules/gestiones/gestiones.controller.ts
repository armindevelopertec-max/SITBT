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
import { GestionesService } from './gestiones.service';
import { CrearGestionDto } from './dto/create-gestion.dto';
import { ActualizarGestionDto } from './dto/update-gestion.dto';
import { CreatePeriodoDto, UpdatePeriodoDto } from './dto/periodo.dto';
import { EstadoGestion } from '../../entities/enums/estado-gestion.enum';
import { GuardaJwt } from '../autenticacion/guarda-jwt';

@ApiTags('Gestiones')
@Controller('gestiones')
export class GestionesController {
  constructor(private readonly gestionesService: GestionesService) {}

  @Post()
  @UseGuards(GuardaJwt)
  @ApiBearerAuth()
  crear(@Body() crearGestionDto: CrearGestionDto) {
    return this.gestionesService.create(crearGestionDto);
  }

  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: EstadoGestion,
  ) {
    return this.gestionesService.findAll(+page, +limit, status);
  }

  @Get('active')
  findActive() {
    return this.gestionesService.findActive();
  }

  @Get('current')
  findCurrent() {
    return this.gestionesService.findCurrent();
  }

  @Get('year/:year')
  findByAnio(@Param('year') year: string) {
    return this.gestionesService.findByAnio(year);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.gestionesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(GuardaJwt)
  @ApiBearerAuth()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGestionDto: ActualizarGestionDto,
  ) {
    return this.gestionesService.update(id, updateGestionDto);
  }

  @Post(':id/open')
  @UseGuards(GuardaJwt)
  @ApiBearerAuth()
  open(@Param('id', ParseIntPipe) id: number) {
    return this.gestionesService.open(id);
  }

  @Post(':id/close')
  @UseGuards(GuardaJwt)
  @ApiBearerAuth()
  close(@Param('id', ParseIntPipe) id: number) {
    return this.gestionesService.close(id);
  }

  @Post(':id/set-current')
  @UseGuards(GuardaJwt)
  @ApiBearerAuth()
  setCurrent(@Param('id', ParseIntPipe) id: number) {
    return this.gestionesService.setCurrent(id);
  }

  @Delete(':id')
  @UseGuards(GuardaJwt)
  @ApiBearerAuth()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.gestionesService.remove(id);
  }

  @Post(':gestionId/periodos')
  @UseGuards(GuardaJwt)
  @ApiBearerAuth()
  createPeriodo(
    @Param('gestionId', ParseIntPipe) gestionId: number,
    @Body() createPeriodoDto: CreatePeriodoDto,
  ) {
    return this.gestionesService.createPeriodo(gestionId, createPeriodoDto);
  }

  @Patch('periodos/:periodoId')
  @UseGuards(GuardaJwt)
  @ApiBearerAuth()
  updatePeriodo(
    @Param('periodoId', ParseIntPipe) periodoId: number,
    @Body() updatePeriodoDto: UpdatePeriodoDto,
  ) {
    return this.gestionesService.updatePeriodo(periodoId, updatePeriodoDto);
  }

  @Delete('periodos/:periodoId')
  @UseGuards(GuardaJwt)
  @ApiBearerAuth()
  deletePeriodo(@Param('periodoId', ParseIntPipe) periodoId: number) {
    return this.gestionesService.deletePeriodo(periodoId);
  }

  @Post('periodos/:periodoId/open')
  @UseGuards(GuardaJwt)
  @ApiBearerAuth()
  openPeriodo(@Param('periodoId', ParseIntPipe) periodoId: number) {
    return this.gestionesService.openPeriodo(periodoId);
  }

  @Post('periodos/:periodoId/close')
  @UseGuards(GuardaJwt)
  @ApiBearerAuth()
  closePeriodo(@Param('periodoId', ParseIntPipe) periodoId: number) {
    return this.gestionesService.closePeriodo(periodoId);
  }
}
