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
import { StudyPlansService } from './study-plans.service';
import { CreateStudyPlanDto } from './dto/create-study-plan.dto';
import { UpdateStudyPlanDto } from './dto/update-study-plan.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';
import { StudyPlanStatus } from '../../entities/plan-estudio.entity';

@ApiTags('PlanesEstudio')
@Controller('planes-estudio')
@UseGuards(GuardaJwt)
@ApiBearerAuth()
export class StudyPlansController {
  constructor(private readonly studyPlansService: StudyPlansService) {}

  @Post()
  create(@Body() createStudyPlanDto: CreateStudyPlanDto) {
    return this.studyPlansService.create(createStudyPlanDto);
  }

  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: StudyPlanStatus,
    @Query('careerId') careerId?: number,
  ) {
    return this.studyPlansService.findAll(+page, +limit, status, careerId ? +careerId : undefined);
  }

  @Get('active')
  findActive() {
    return this.studyPlansService.findActive();
  }

  @Get('by-career/:careerId')
  findByCareer(@Param('careerId', ParseIntPipe) careerId: number) {
    return this.studyPlansService.findByCareer(careerId);
  }

  @Get('current/:careerId')
  findCurrentByCareer(@Param('careerId', ParseIntPipe) careerId: number) {
    return this.studyPlansService.findCurrentByCareer(careerId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studyPlansService.findOneWithMaterias(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateStudyPlanDto: UpdateStudyPlanDto) {
    return this.studyPlansService.update(id, updateStudyPlanDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.studyPlansService.remove(id);
  }

  @Post(':id/materias')
  addMateria(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { subject_id: number; semester: number; weekly_hours: number; prerequisite_id?: number },
  ) {
    return this.studyPlansService.addMateria(id, body.subject_id, body.semester, body.weekly_hours, body.prerequisite_id);
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
    @Body() body: { semester: number; weekly_hours: number; prerequisite_id?: number },
  ) {
    return this.studyPlansService.updateMateria(materiaPlanId, body.semester, body.weekly_hours, body.prerequisite_id);
  }

  @Get(':id/materias')
  getMaterias(@Param('id', ParseIntPipe) id: number) {
    return this.studyPlansService.getMaterias(id);
  }
}