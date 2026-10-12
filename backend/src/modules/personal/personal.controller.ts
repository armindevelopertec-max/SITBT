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
import { ServicioPersonal } from './personal.service';
import { CrearPersonalDto } from './dto/crear-personal.dto';
import { ActualizarPersonalDto } from './dto/actualizar-personal.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';
import { EstadoPersonal, CargoPersonal } from '../../entities/personal.entity';

@ApiTags('Personal')
@Controller('personal')
@UseGuards(GuardaJwt)
@ApiBearerAuth()
export class ControladorPersonal {
  constructor(private readonly staffsService: ServicioPersonal) {}

  @Post()
  create(@Body() createStaffDto: CrearPersonalDto) {
    return this.staffsService.create(createStaffDto);
  }

  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: EstadoPersonal,
    @Query('position') position?: CargoPersonal,
  ) {
    return this.staffsService.findAll(+page, +limit, status, position);
  }

  @Get('active')
  findActive() {
    return this.staffsService.findActive();
  }

  @Get('teachers')
  findTeachers() {
    return this.staffsService.findTeachers();
  }

  @Get('by-position/:position')
  findByPosition(@Param('position') position: CargoPersonal) {
    return this.staffsService.findByPosition(position);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.staffsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateStaffDto: ActualizarPersonalDto) {
    return this.staffsService.update(id, updateStaffDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.staffsService.remove(id);
  }
}