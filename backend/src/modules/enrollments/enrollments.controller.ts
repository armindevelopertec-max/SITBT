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
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EnrollmentStatus } from '../../entities/inscripcion.entity';

@ApiTags('Inscripciones')
@Controller('inscripciones')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  create(@Body() createEnrollmentDto: CreateEnrollmentDto) {
    return this.enrollmentsService.create(createEnrollmentDto);
  }

  @Post('bulk')
  bulkCreate(@Body() createEnrollmentDtos: CreateEnrollmentDto[]) {
    return this.enrollmentsService.bulkCreate(createEnrollmentDtos);
  }

  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('gestion') gestion?: string,
    @Query('status') status?: EnrollmentStatus,
    @Query('studentId') studentId?: number,
  ) {
    return this.enrollmentsService.findAll(
      +page,
      +limit,
      gestion,
      status,
      studentId ? +studentId : undefined,
    );
  }

  @Get('student/:studentId')
  findByStudent(@Param('studentId', ParseIntPipe) studentId: number, @Query('gestion') gestion?: string) {
    return this.enrollmentsService.findByStudent(studentId, gestion);
  }

  @Get('student/:studentId/academic-record')
  getAcademicRecord(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.enrollmentsService.getStudentAcademicRecord(studentId);
  }

  @Get('subject/:subjectId')
  findBySubject(@Param('subjectId', ParseIntPipe) subjectId: number, @Query('gestion') gestion: string) {
    return this.enrollmentsService.findBySubject(subjectId, gestion);
  }

  @Get('group/:groupId')
  findByGroup(@Param('groupId', ParseIntPipe) groupId: number, @Query('gestion') gestion: string) {
    return this.enrollmentsService.findByGroup(groupId, gestion);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.enrollmentsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateEnrollmentDto: UpdateEnrollmentDto) {
    return this.enrollmentsService.update(id, updateEnrollmentDto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: EnrollmentStatus; finalGrade?: number },
  ) {
    return this.enrollmentsService.updateStatus(id, body.status, body.finalGrade);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.enrollmentsService.remove(id);
  }
}