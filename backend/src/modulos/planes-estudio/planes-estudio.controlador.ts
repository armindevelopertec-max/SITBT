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
import { ServicioPlanesEstudio } from './planes-estudio.servicio';
import { CrearPlanEstudioDto } from './dto/crear-plan-estudio.dto';
import { ActualizarPlanEstudioDto } from './dto/actualizar-plan-estudio.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';
import { EstadoPlanEstudio } from '../../entidades/plan-estudio.entidad';

@ApiTags('PlanesEstudio')
@Controller('planes-estudio')
@UseGuards(GuardaJwt)
@ApiBearerAuth()
export class ControladorPlanesEstudio {
  constructor(private readonly servicioPlanesEstudio: ServicioPlanesEstudio) {}

  @Post()
  crear(@Body() crearPlanEstudioDto: CrearPlanEstudioDto) {
    return this.servicioPlanesEstudio.crear(crearPlanEstudioDto);
  }

  @Get()
  obtenerTodos(
    @Query('pagina') pagina = 1,
    @Query('limite') limite = 20,
    @Query('estado') estado?: EstadoPlanEstudio,
    @Query('carreraId') carreraId?: number,
  ) {
    return this.servicioPlanesEstudio.obtenerTodos(+pagina, +limite, estado, carreraId ? +carreraId : undefined);
  }

  @Get('activos')
  obtenerActivos() {
    return this.servicioPlanesEstudio.obtenerActivos();
  }

  @Get('por-carrera/:carreraId')
  buscarPorCarrera(@Param('carreraId', ParseIntPipe) carreraId: number) {
    return this.servicioPlanesEstudio.buscarPorCarrera(carreraId);
  }

  @Get('actual/:carreraId')
  buscarActualPorCarrera(@Param('carreraId', ParseIntPipe) carreraId: number) {
    return this.servicioPlanesEstudio.buscarActualPorCarrera(carreraId);
  }

  @Get(':id')
  obtenerUno(@Param('id', ParseIntPipe) id: number) {
    return this.servicioPlanesEstudio.obtenerUnoConMaterias(id);
  }

  @Patch(':id')
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() actualizarPlanEstudioDto: ActualizarPlanEstudioDto) {
    return this.servicioPlanesEstudio.actualizar(id, actualizarPlanEstudioDto);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.servicioPlanesEstudio.eliminar(id);
  }

  @Post(':id/materias')
  agregarMateria(
    @Param('id', ParseIntPipe) id: number,
    @Body() cuerpo: { materiaId: number; semestre: number; horasSemanales: number; prerrequisitoId?: number },
  ) {
    return this.servicioPlanesEstudio.agregarMateria(id, cuerpo.materiaId, cuerpo.semestre, cuerpo.horasSemanales, cuerpo.prerrequisitoId);
  }

  @Delete(':id/materias/:materiaPlanId')
  eliminarMateria(
    @Param('id', ParseIntPipe) id: number,
    @Param('materiaPlanId', ParseIntPipe) materiaPlanId: number,
  ) {
    return this.servicioPlanesEstudio.eliminarMateria(materiaPlanId);
  }

  @Patch(':id/materias/:materiaPlanId')
  actualizarMateria(
    @Param('id', ParseIntPipe) id: number,
    @Param('materiaPlanId', ParseIntPipe) materiaPlanId: number,
    @Body() cuerpo: { semestre: number; horasSemanales: number; prerrequisitoId?: number },
  ) {
    return this.servicioPlanesEstudio.actualizarMateria(materiaPlanId, cuerpo.semestre, cuerpo.horasSemanales, cuerpo.prerrequisitoId);
  }

  @Get(':id/materias')
  obtenerMaterias(@Param('id', ParseIntPipe) id: number) {
    return this.servicioPlanesEstudio.obtenerMaterias(id);
  }
}
