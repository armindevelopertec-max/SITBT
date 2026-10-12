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
import { ConvalidationsService } from './convalidations.service';
import { CreateConvalidationDto } from './dto/create-convalidation.dto';
import { UpdateConvalidationDto } from './dto/update-convalidation.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';
import { ConvalidationStatus, ConvalidationType } from '../../entities/convalidacion-estudiante.entity';

@ApiTags('Convalidaciones')
@Controller('convalidaciones')
@UseGuards(GuardaJwt)
@ApiBearerAuth()
export class ConvalidationsController {
  constructor(private readonly service: ConvalidationsService) {}

  @Post()
  create(@Body() createDto: CreateConvalidationDto) {
    return this.service.create(createDto);
  }

  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: ConvalidationStatus,
    @Query('type') type?: ConvalidationType,
    @Query('studentId') studentId?: number,
  ) {
    return this.service.findAll(+page, +limit, status, type, studentId ? +studentId : undefined);
  }

  @Get('pending')
  getPending() {
    return this.service.getPending();
  }

  @Get('student/:studentId')
  findByStudent(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.service.findByStudent(studentId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateConvalidationDto) {
    return this.service.update(id, updateDto);
  }

  @Patch(':id/approve')
  approve(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { approvedBy: number; resolutionNumber?: string; resolutionDate?: string },
  ) {
    return this.service.approve(
      id,
      body.approvedBy,
      body.resolutionNumber,
      body.resolutionDate ? new Date(body.resolutionDate) : undefined,
    );
  }

  @Patch(':id/reject')
  reject(@Param('id', ParseIntPipe) id: number) {
    return this.service.reject(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}