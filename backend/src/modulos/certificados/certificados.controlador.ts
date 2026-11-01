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
import { ServicioCertificados } from './certificados.servicio';
import { CrearCertificadoDto } from './dto/crear-certificado.dto';
import { ActualizarCertificadoDto } from './dto/actualizar-certificado.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';
import { GuardaRoles } from '../autenticacion/guarda-roles';
import { Roles } from '../autenticacion/roles.decorador';

@ApiTags('Certificados')
@Controller('certificados')
export class ControladorCertificados {
  constructor(private readonly servicio: ServicioCertificados) {}

  @Post()
  @UseGuards(GuardaJwt, GuardaRoles)
  @Roles('administrador', 'secretaria', 'director_academico')
  @ApiBearerAuth()
  crear(@Body() dtoCreacion: CrearCertificadoDto) {
    return this.servicio.crear(dtoCreacion);
  }

  @Get()
  @UseGuards(GuardaJwt, GuardaRoles)
  @Roles('administrador', 'secretaria', 'director_academico')
  @ApiBearerAuth()
  obtenerTodos(
    @Query('pagina') pagina = 1,
    @Query('limite') limite = 20,
    @Query('gestion') gestion?: string,
    @Query('tipo') tipo?: string,
    @Query('estudianteId') estudianteId?: number,
  ) {
    return this.servicio.obtenerTodos(+pagina, +limite, gestion, tipo, estudianteId ? +estudianteId : undefined);
  }

  @Get('estudiante/:estudianteId')
  @UseGuards(GuardaJwt, GuardaRoles)
  @Roles('administrador', 'secretaria', 'director_academico')
  @ApiBearerAuth()
  buscarPorEstudiante(@Param('estudianteId', ParseIntPipe) estudianteId: number) {
    return this.servicio.buscarPorEstudiante(estudianteId);
  }

  @Get('verificar/:codigo')
  verificarCertificado(@Param('codigo') codigo: string) {
    return this.servicio.verificarCertificado(codigo);
  }

  @Get('codigo/:codigo')
  @UseGuards(GuardaJwt, GuardaRoles)
  @Roles('administrador', 'secretaria', 'director_academico')
  @ApiBearerAuth()
  buscarPorCodigo(@Param('codigo') codigo: string) {
    return this.servicio.buscarPorCodigo(codigo);
  }

  @Get(':id')
  @UseGuards(GuardaJwt, GuardaRoles)
  @Roles('administrador', 'secretaria', 'director_academico')
  @ApiBearerAuth()
  obtenerUno(@Param('id', ParseIntPipe) id: number) {
    return this.servicio.obtenerUno(id);
  }

  @Patch(':id')
  @UseGuards(GuardaJwt, GuardaRoles)
  @Roles('administrador', 'secretaria', 'director_academico')
  @ApiBearerAuth()
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dtoActualizacion: ActualizarCertificadoDto) {
    return this.servicio.actualizar(id, dtoActualizacion);
  }

  @Delete(':id')
  @UseGuards(GuardaJwt, GuardaRoles)
  @Roles('administrador', 'secretaria', 'director_academico')
  @ApiBearerAuth()
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.servicio.eliminar(id);
  }
}
