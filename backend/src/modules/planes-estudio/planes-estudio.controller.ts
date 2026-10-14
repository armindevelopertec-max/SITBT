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
import { ServicioPlanesEstudio } from './planes-estudio.service';
import { CrearPlanEstudioDto } from './dto/crear-plan-estudio.dto';
import { ActualizarPlanEstudioDto } from './dto/actualizar-plan-estudio.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';
import { EstadoPlanEstudio } from '../../entities/plan-estudio.entity';

@ApiTags('PlanesEstudio')
@Controller('planes-estudio')
@UseGuards(GuardaJwt)
@ApiBearerAuth()
export class ControladorPlanesEstudio {
  constructor(private readonly studyPlansService: ServicioPlanesEstudio) {}

  @Post()
  create(@Body() crearPlanEstudioDto: CrearPlanEstudioDto) {
    return this.studyPlansService.create(crearPlanEstudioDto);
  }

  @Get()
  findAll(
    @Query('pagina') page = 1,
    @Query('limite') limit = 20,
    @Query('estado') status?: EstadoPlanEstudio,
    @Query('carreraId') careerId?: number,
  ) {
    return this.studyPlansService.findAll(+page, +limit, status, careerId ? +careerId : undefined);
  }

  @Get('activos')
  findActive() {
    return this.studyPlansService.findActive();
  }

  @Get('por-carrera/:carreraId')
  findByCareer(@Param('careerId', ParseIntPipe) careerId: number) {
    return this.studyPlansService.findByCareer(careerId);
  }

  @Get('actual/:carreraId')
  findCurrentByCareer(@Param('careerId', ParseIntPipe) careerId: number) {
    return this.studyPlansService.findCurrentByCareer(careerId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studyPlansService.findOneWithMaterias(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() actualizarPlanEstudioDto: ActualizarPlanEstudioDto) {
    return this.studyPlansService.update(id, actualizarPlanEstudioDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.studyPlansService.remove(id);
  }

  @Post(':id/materias')
  addMateria(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { materiaId: number; semestre: number; horasSemanales: number; prerrequisitoId?: number },
  ) {
    return this.studyPlansService.addMateria(id, body.materiaId, body.semestre, body.horasSemanales, body.prerrequisitoId);
  }

  @Delete(':id/materias/:materiaPlanId')
  removeMateria(
    @Param('id', ParseIntPipe) id: number,
    @Param('materiaPlanId', ParseIntPipe) materiaPlanId: number,
  ) {
    return this.studyPlansService.removeMateria(materiaPlanId);
  }

  @Patch(':id/materias/:materiaPlanId')
  updateMateria(
    @Param('id', ParseIntPipe) id: number,
    @Param('materiaPlanId', ParseIntPipe) materiaPlanId: number,
    @Body() body: { semestre: number; horasSemanales: number; prerrequisitoId?: number },
  ) {
    return this.studyPlansService.updateMateria(materiaPlanId, body.semestre, body.horasSemanales, body.prerrequisitoId);
  }

  @Get(':id/materias')
  getMaterias(@Param('id', ParseIntPipe) id: number) {
    return this.studyPlansService.getMaterias(id);
  }
}