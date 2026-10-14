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
import { ServicioGrupos } from './grupos.service';
import { CrearGrupoDto } from './dto/crear-grupo.dto';
import { ActualizarGrupoDto } from './dto/actualizar-grupo.dto';
import { GenerarGruposDto } from './dto/generar-grupos.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';

@ApiTags('Grupos')
@Controller('grupos')
@UseGuards(GuardaJwt)
@ApiBearerAuth()
export class ControladorGrupos {
  constructor(private readonly groupsService: ServicioGrupos) {}

  @Post()
  create(@Body() crearGrupoDto: CrearGrupoDto) {
    return this.groupsService.create(crearGrupoDto);
  }

  @Post('generar')
  generate(@Body() generateGroupsDto: GenerarGruposDto) {
    return this.groupsService.generateGroups(generateGroupsDto);
  }

  @Get()
  findAll(
    @Query('pagina') page = 1,
    @Query('limite') limit = 20,
    @Query('gestion') gestion?: string,
    @Query('carreraId') careerId?: number,
    @Query('semestre') semester?: number,
  ) {
    return this.groupsService.findAll(
      +page,
      +limit,
      gestion,
      careerId ? +careerId : undefined,
      semester ? +semester : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.findOne(id);
  }

  @Get(':id/estudiantes')
  getStudents(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.getStudents(id);
  }

  @Get(':id/estadisticas')
  getGroupStats(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.getGroupStats(id);
  }

  @Get('por-carrera-turno')
  findByCareerAndShift(
    @Query('carreraId') careerId: number,
    @Query('gestion') gestion: string,
    @Query('semestre') semester: number,
    @Query('turnoId') shiftId: number,
  ) {
    return this.groupsService.findByCareerAndShift(+careerId, gestion, +semester, +shiftId);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() actualizarGrupoDto: ActualizarGrupoDto) {
    return this.groupsService.update(id, actualizarGrupoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.remove(id);
  }

  @Post(':id/estudiantes/:estudianteId')
  addStudent(@Param('id', ParseIntPipe) id: number, @Param('studentId', ParseIntPipe) studentId: number) {
    return this.groupsService.addStudent(id, studentId);
  }

  @Delete(':id/estudiantes/:estudianteId')
  removeStudent(@Param('id', ParseIntPipe) id: number, @Param('studentId', ParseIntPipe) studentId: number) {
    return this.groupsService.removeStudent(id, studentId);
  }
}