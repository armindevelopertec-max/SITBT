import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ServicioConfiguracionInstitucional } from './configuracion-institucional.service';
import { CrearConfiguracionInstitucionalDto } from './dto/crear-configuracion-institucional.dto';
import { ActualizarConfiguracionInstitucionalDto } from './dto/actualizar-configuracion-institucional.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';

@ApiTags('Institution Settings')
@Controller('configuracion-institucional')
export class ControladorConfiguracionInstitucional {
  constructor(private readonly servicioConfiguracion: ServicioConfiguracionInstitucional) {}

  @Get()
  @ApiOperation({ summary: 'Obtener configuración institucional (público)' })
  obtenerTodos() {
    return this.servicioConfiguracion.obtenerTodos();
  }

  @Get('publico')
  @ApiOperation({ summary: 'Obtener datos públicos de la institución' })
  obtenerConfiguracionPublica() {
    return this.servicioConfiguracion.obtenerConfiguracionPublica();
  }

  @Get('individual')
  @ApiOperation({ summary: 'Obtener configuración única' })
  obtenerUno() {
    return this.servicioConfiguracion.obtenerUno();
  }

  @Post()
  @UseGuards(GuardaJwt)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear configuración institucional' })
  crear(@Body() crearDto: CrearConfiguracionInstitucionalDto) {
    return this.servicioConfiguracion.crearOActualizar(crearDto);
  }

  @Put()
  @UseGuards(GuardaJwt)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar configuración institucional' })
  actualizar(@Body() actualizarDto: ActualizarConfiguracionInstitucionalDto) {
    return this.servicioConfiguracion.actualizar(1, actualizarDto);
  }
}
