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
import { TeachingAssignmentsService } from './teaching-assignments.service';
import { CreateTeachingAssignmentDto } from './dto/create-teaching-assignment.dto';
import { UpdateTeachingAssignmentDto } from './dto/update-teaching-assignment.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';
import { TeachingAssignmentStatus } from '../../entities/asignacion-docente.entity';

@ApiTags('AsignacionesDocentes')
@Controller('asignaciones-docentes')
@UseGuards(GuardaJwt)
@ApiBearerAuth()
export class TeachingAssignmentsController {
  constructor(private readonly service: TeachingAssignmentsService) {}

  @Post()
  create(@Body() createDto: CreateTeachingAssignmentDto) {
    return this.service.create(createDto);
  }

  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('gestion') gestion?: string,
    @Query('status') status?: TeachingAssignmentStatus,
  ) {
    return this.service.findAll(+page, +limit, gestion, status);
  }

  @Get('active')
  findActive(@Query('gestion') gestion: string) {
    return this.service.findActive(gestion);
  }

  @Get('teacher/:teacherId')
  findByTeacher(@Param('teacherId', ParseIntPipe) teacherId: number, @Query('gestion') gestion?: string) {
    return this.service.findByTeacher(teacherId, gestion);
  }

  @Get('group/:groupId')
  findByGroup(@Param('groupId', ParseIntPipe) groupId: number, @Query('gestion') gestion: string) {
    return this.service.findByGroup(groupId, gestion);
  }

  @Get('subject/:subjectId')
  findBySubject(@Param('subjectId', ParseIntPipe) subjectId: number, @Query('gestion') gestion: string) {
    return this.service.findBySubject(subjectId, gestion);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateTeachingAssignmentDto) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}