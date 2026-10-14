import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ServicioNotificaciones } from './notificaciones.service';
import { EnviarCorreoDto, EnviarNotificacionDto } from './dto/enviar-notificacion.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';

@ApiTags('Notificaciones')
@Controller('notificaciones')
@UseGuards(GuardaJwt)
@ApiBearerAuth()
export class ControladorNotificaciones {
  constructor(private readonly service: ServicioNotificaciones) {}

  @Post('correo')
  @HttpCode(200)
  enviarCorreo(@Body() dto: EnviarCorreoDto) {
    return this.service.enviarCorreo(dto.para, dto.asunto, dto.contenido);
  }

  @Post('pre-registro-aceptado')
  @HttpCode(200)
  notificarPreRegistroAceptado(
    @Body('estudianteId') estudianteId: number,
    @Body('correo') correo: string,
    @Body('nombre') nombre: string,
  ) {
    return this.service.notificarPreRegistroAceptado(estudianteId, correo, nombre);
  }

  @Post('pago-confirmado')
  @HttpCode(200)
  notificarPagoConfirmado(
    @Body('estudianteId') estudianteId: number,
    @Body('correo') correo: string,
    @Body('nombre') nombre: string,
    @Body('monto') monto: number,
  ) {
    return this.service.notificarPagoConfirmado(estudianteId, correo, nombre, monto);
  }

  @Post('carnet-listo')
  @HttpCode(200)
  notificarCarnetListo(
    @Body('estudianteId') estudianteId: number,
    @Body('correo') correo: string,
    @Body('nombre') nombre: string,
  ) {
    return this.service.notificarCarnetListo(estudianteId, correo, nombre);
  }

  @Post('deuda-pendiente')
  @HttpCode(200)
  notificarDeudaPendiente(
    @Body('estudianteId') estudianteId: number,
    @Body('correo') correo: string,
    @Body('nombre') nombre: string,
    @Body('monto') monto: number,
  ) {
    return this.service.notificarDeudaPendiente(estudianteId, correo, nombre, monto);
  }

  @Post('documento-generado')
  @HttpCode(200)
  notificarDocumentoGenerado(
    @Body('estudianteId') estudianteId: number,
    @Body('correo') correo: string,
    @Body('nombre') nombre: string,
    @Body('tipoDoc') tipoDoc: string,
  ) {
    return this.service.notificarDocumentoGenerado(estudianteId, correo, nombre, tipoDoc);
  }
}
