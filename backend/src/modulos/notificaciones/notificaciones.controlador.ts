import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ServicioNotificaciones } from './notificaciones.servicio';
import { EnviarCorreoDto, EnviarNotificacionDto } from './dto/enviar-notificacion.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';

@ApiTags('Notificaciones')
@Controller('notificaciones')
@UseGuards(GuardaJwt)
@ApiBearerAuth()
export class ControladorNotificaciones {
  constructor(private readonly servicio: ServicioNotificaciones) {}

  @Post('correo')
  @HttpCode(200)
  enviarCorreo(@Body() dto: EnviarCorreoDto) {
    return this.servicio.enviarCorreo(dto.para, dto.asunto, dto.contenido);
  }

  @Post('pre-registro-aceptado')
  @HttpCode(200)
  notificarPreRegistroAceptado(
    @Body('estudianteId') estudianteId: number,
    @Body('correo') correo: string,
    @Body('nombre') nombre: string,
  ) {
    return this.servicio.notificarPreRegistroAceptado(estudianteId, correo, nombre);
  }

  @Post('pago-confirmado')
  @HttpCode(200)
  notificarPagoConfirmado(
    @Body('estudianteId') estudianteId: number,
    @Body('correo') correo: string,
    @Body('nombre') nombre: string,
    @Body('monto') monto: number,
  ) {
    return this.servicio.notificarPagoConfirmado(estudianteId, correo, nombre, monto);
  }

  @Post('carnet-listo')
  @HttpCode(200)
  notificarCarnetListo(
    @Body('estudianteId') estudianteId: number,
    @Body('correo') correo: string,
    @Body('nombre') nombre: string,
  ) {
    return this.servicio.notificarCarnetListo(estudianteId, correo, nombre);
  }

  @Post('deuda-pendiente')
  @HttpCode(200)
  notificarDeudaPendiente(
    @Body('estudianteId') estudianteId: number,
    @Body('correo') correo: string,
    @Body('nombre') nombre: string,
    @Body('monto') monto: number,
  ) {
    return this.servicio.notificarDeudaPendiente(estudianteId, correo, nombre, monto);
  }

  @Post('documento-generado')
  @HttpCode(200)
  notificarDocumentoGenerado(
    @Body('estudianteId') estudianteId: number,
    @Body('correo') correo: string,
    @Body('nombre') nombre: string,
    @Body('tipoDoc') tipoDoc: string,
  ) {
    return this.servicio.notificarDocumentoGenerado(estudianteId, correo, nombre, tipoDoc);
  }
}
