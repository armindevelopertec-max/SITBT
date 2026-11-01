import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ServicioAsistencias } from './asistencias.servicio';
import { MarcarAsistenciaDto } from './dto/marcar-asistencia.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';
import { GuardaRoles } from '../autenticacion/guarda-roles';
import { Roles } from '../autenticacion/roles.decorador';
import { TipoMarcacion } from '../../entidades/marcacion-personal.entidad';

@ApiTags('Asistencias del Personal')
@Controller('asistencias-personal')
export class ControladorAsistencias {
  constructor(private readonly servicioAsistencias: ServicioAsistencias) {}

  /**
   * Endpoint que usará el lector biométrico (o la marcación manual).
   * No lleva guardia para que el dispositivo pueda llamarlo; se recomienda
   * protegerlo con una clave de dispositivo cuando haya hardware real.
   */
  @Post('marcar')
  marcar(@Body() dto: MarcarAsistenciaDto) {
    return this.servicioAsistencias.marcar(dto);
  }

  @Get('estado-hoy')
  @UseGuards(GuardaJwt, GuardaRoles)
  @Roles('administrador', 'secretaria', 'director_academico', 'rector', 'apoyo')
  @ApiBearerAuth()
  estadoHoy() {
    return this.servicioAsistencias.estadoHoy();
  }

  @Get('hoy')
  @UseGuards(GuardaJwt, GuardaRoles)
  @Roles('administrador', 'secretaria', 'director_academico', 'rector', 'apoyo')
  @ApiBearerAuth()
  marcacionesHoy() {
    return this.servicioAsistencias.marcacionesHoy();
  }

  @Get('historial')
  @UseGuards(GuardaJwt, GuardaRoles)
  @Roles('administrador', 'secretaria', 'director_academico', 'rector', 'apoyo')
  @ApiBearerAuth()
  historial(
    @Query('pagina') pagina = '1',
    @Query('limite') limite = '20',
    @Query('personalId') personalId?: string,
    @Query('tipo') tipo?: TipoMarcacion,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.servicioAsistencias.historial(
      Number(pagina) || 1,
      Number(limite) || 20,
      {
        personalId: personalId ? Number(personalId) : undefined,
        tipo,
        desde,
        hasta,
      },
    );
  }

  @Delete('marcacion/:id')
  @UseGuards(GuardaJwt, GuardaRoles)
  @Roles('administrador', 'secretaria', 'director_academico', 'rector', 'apoyo')
  @ApiBearerAuth()
  eliminarMarcacion(@Param('id', ParseIntPipe) id: number) {
    return this.servicioAsistencias.eliminarMarcacion(id);
  }
}
