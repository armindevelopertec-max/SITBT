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
import { CreateGestionDto } from './dto/create-gestion.dto';
import { UpdateGestionDto } from './dto/update-gestion.dto';
import { CreatePeriodoDto, UpdatePeriodoDto } from './dto/periodo.dto';
import { GestionStatus } from '../../entities/enums/gestion-status.enum';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Gestiones')
@Controller('gestiones')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GestionesController {
  constructor(private readonly gestionesService: GestionesService) {}

  @Post()
  create(@Body() createGestionDto: CreateGestionDto) {
    return this.gestionesService.create(createGestionDto);
  }

  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: GestionStatus,
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
  findByYear(@Param('year') year: string) {
    return this.gestionesService.findByYear(year);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.gestionesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGestionDto: UpdateGestionDto,
  ) {
    return this.gestionesService.update(id, updateGestionDto);
  }

  @Post(':id/open')
  open(@Param('id', ParseIntPipe) id: number) {
    return this.gestionesService.open(id);
  }

  @Post(':id/close')
  close(@Param('id', ParseIntPipe) id: number) {
    return this.gestionesService.close(id);
  }

  @Post(':id/set-current')
  setCurrent(@Param('id', ParseIntPipe) id: number) {
    return this.gestionesService.setCurrent(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.gestionesService.remove(id);
  }

  @Post(':gestionId/periodos')
  createPeriodo(
    @Param('gestionId', ParseIntPipe) gestionId: number,
    @Body() createPeriodoDto: CreatePeriodoDto,
  ) {
    return this.gestionesService.createPeriodo(gestionId, createPeriodoDto);
  }

  @Patch('periodos/:periodoId')
  updatePeriodo(
    @Param('periodoId', ParseIntPipe) periodoId: number,
    @Body() updatePeriodoDto: UpdatePeriodoDto,
  ) {
    return this.gestionesService.updatePeriodo(periodoId, updatePeriodoDto);
  }

  @Delete('periodos/:periodoId')
  deletePeriodo(@Param('periodoId', ParseIntPipe) periodoId: number) {
    return this.gestionesService.deletePeriodo(periodoId);
  }

  @Post('periodos/:periodoId/open')
  openPeriodo(@Param('periodoId', ParseIntPipe) periodoId: number) {
    return this.gestionesService.openPeriodo(periodoId);
  }

  @Post('periodos/:periodoId/close')
  closePeriodo(@Param('periodoId', ParseIntPipe) periodoId: number) {
    return this.gestionesService.closePeriodo(periodoId);
  }
}
