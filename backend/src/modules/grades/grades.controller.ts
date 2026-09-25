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
import { GradesService } from './grades.service';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GradeStatusDefinitivo } from '../../entities/calificacion.entity';

@ApiTags('Calificaciones')
@Controller('calificaciones')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Post()
  create(@Body() createGradeDto: CreateGradeDto) {
    return this.gradesService.create(createGradeDto);
  }

  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('gestion') gestion?: string,
    @Query('statusDefinitivo') statusDefinitivo?: GradeStatusDefinitivo,
  ) {
    return this.gradesService.findAll(+page, +limit, gestion, statusDefinitivo);
  }

  @Get('student/:studentId')
  getGradesByStudent(@Param('studentId', ParseIntPipe) studentId: number, @Query('gestion') gestion?: string) {
    return this.gradesService.getGradesByStudent(studentId, gestion);
  }

  @Get('group/:groupId')
  getGradesByGroup(@Param('groupId', ParseIntPipe) groupId: number, @Query('gestion') gestion: string) {
    return this.gradesService.getGradesByGroup(groupId, gestion);
  }

  @Get('enrollment/:enrollmentId')
  findByEnrollment(@Param('enrollmentId', ParseIntPipe) enrollmentId: number) {
    return this.gradesService.findByEnrollment(enrollmentId);
  }

  @Get('enrollment/:enrollmentId/history')
  getGradeHistory(@Param('enrollmentId', ParseIntPipe) enrollmentId: number) {
    return this.gradesService.getGradeHistory(enrollmentId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.gradesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGradeDto: UpdateGradeDto,
    @Body('registeredBy') registeredBy: number,
  ) {
    return this.gradesService.update(id, updateGradeDto, registeredBy);
  }

  @Patch(':id/partials')
  updatePartialGrades(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { partial1?: number; partial2?: number; registeredBy?: number },
  ) {
    return this.gradesService.updatePartialGrades(id, body.partial1, body.partial2, body.registeredBy);
  }

  @Patch(':id/second-turn')
  applySecondTurn(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { score: number; registeredBy?: number },
  ) {
    return this.gradesService.applySecondTurn(id, body.score, body.registeredBy);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.gradesService.remove(id);
  }
}