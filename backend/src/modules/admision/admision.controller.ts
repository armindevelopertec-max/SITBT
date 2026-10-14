import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  HttpCode,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ServicioAdmision } from './admision.service';
import { CrearAdmisionDto } from './dto/crear-admision.dto';
import { ActualizarAdmisionDto } from './dto/actualizar-admision.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';
import { EstadoAdmision } from '../../entities/admission-request.entity';

@ApiTags('Admision')
@Controller('admision')
export class ControladorAdmision {
  constructor(private readonly service: ServicioAdmision) {}

  @Post()
  create(@Body() createDto: CrearAdmisionDto) {
    return this.service.create(createDto);
  }

  @Get()
  findAll(
    @Query('pagina') page = 1,
    @Query('limite') limit = 20,
    @Query('estado') estado?: EstadoAdmision,
    @Query('origen') origen?: string,
  ) {
    return this.service.findAll(+page, +limit, estado, origen);
  }

  @Get('estadisticas')
  getStatistics() {
    return this.service.getStatistics();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: ActualizarAdmisionDto) {
    return this.service.update(id, updateDto);
  }

  @Post(':id/verificar')
  @HttpCode(200)
  verify(
    @Param('id') id: string,
    @Body('verificadoPor') verificadoPor: number,
    @Body('observaciones') observaciones?: string,
  ) {
    return this.service.verify(id, verificadoPor, observaciones);
  }

  @Post(':id/rechazar')
  @HttpCode(200)
  reject(
    @Param('id') id: string,
    @Body('verificadoPor') verificadoPor: number,
    @Body('observaciones') observaciones: string,
  ) {
    return this.service.reject(id, verificadoPor, observaciones);
  }

  @Post(':id/convertir-estudiante')
  @HttpCode(200)
  convertToStudent(
    @Param('id') id: string,
    @Body('gestionAdmision') gestionAdmision: string,
  ) {
    return this.service.convertToStudent(id, gestionAdmision);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
