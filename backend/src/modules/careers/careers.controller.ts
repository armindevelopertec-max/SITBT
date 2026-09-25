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
import { CareersService } from './careers.service';
import { CreateCareerDto } from './dto/create-career.dto';
import { UpdateCareerDto } from './dto/update-career.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CareerStatus } from '../../entities/carrera.entity';

@ApiTags('Carreras')
@Controller('carreras')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CareersController {
  constructor(private readonly careersService: CareersService) {}

  @Post()
  create(@Body() createCareerDto: CreateCareerDto) {
    return this.careersService.create(createCareerDto);
  }

  @Get()
  findAll(@Query('page') page = 1, @Query('limit') limit = 20, @Query('status') status?: CareerStatus) {
    return this.careersService.findAll(+page, +limit, status);
  }

  @Get('active')
  findActive() {
    return this.careersService.findActive();
  }

  @Get('area/:area')
  findByArea(@Param('area') area: string) {
    return this.careersService.findByArea(area);
  }

  @Get('code/:code')
  findByCode(@Param('code') code: string) {
    return this.careersService.findByCode(code);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.careersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateCareerDto: UpdateCareerDto) {
    return this.careersService.update(id, updateCareerDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.careersService.remove(id);
  }
}