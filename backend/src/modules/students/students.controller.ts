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
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StudentStatus } from '../../entities/estudiante.entity';

@ApiTags('Estudiantes')
@Controller('estudiantes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: StudentStatus,
    @Query('careerId') careerId?: number,
  ) {
    return this.studentsService.findAll(+page, +limit, status, careerId ? +careerId : undefined);
  }

  @Get('stats')
  getStats() {
    return this.studentsService.getStudentStats();
  }

  @Get('by-career/:careerId')
  findByCareer(@Param('careerId', ParseIntPipe) careerId: number, @Query('gestion') gestion?: string) {
    return this.studentsService.findByCareer(careerId, gestion);
  }

  @Get('active')
  findActive() {
    return this.studentsService.findActive();
  }

  @Get('count-by-status')
  countByStatus(@Query('careerId') careerId?: number) {
    return this.studentsService.countByStatus(careerId ? +careerId : undefined);
  }

  @Get('inscription/:code')
  findByInscriptionCode(@Param('code') code: string) {
    return this.studentsService.findByInscriptionCode(code);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentsService.update(id, updateStudentDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.remove(id);
  }
}