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
  sendEmail(@Body() dto: EnviarCorreoDto) {
    return this.service.sendEmail(dto.para, dto.asunto, dto.contenido);
  }

  @Post('pre-registro-aceptado')
  @HttpCode(200)
  notifyPreRegistroAceptado(
    @Body('estudianteId') estudianteId: number,
    @Body('correo') correo: string,
    @Body('nombre') nombre: string,
  ) {
    return this.service.notifyPreRegistroAceptado(estudianteId, correo, nombre);
  }

  @Post('pago-confirmado')
  @HttpCode(200)
  notifyPagoConfirmado(
    @Body('estudianteId') estudianteId: number,
    @Body('correo') correo: string,
    @Body('nombre') nombre: string,
    @Body('monto') monto: number,
  ) {
    return this.service.notifyPagoConfirmado(estudianteId, correo, nombre, monto);
  }

  @Post('carnet-listo')
  @HttpCode(200)
  notifyCarnetListo(
    @Body('estudianteId') estudianteId: number,
    @Body('correo') correo: string,
    @Body('nombre') nombre: string,
  ) {
    return this.service.notifyCarnetListo(estudianteId, correo, nombre);
  }

  @Post('deuda-pendiente')
  @HttpCode(200)
  notifyDeudaPendiente(
    @Body('estudianteId') estudianteId: number,
    @Body('correo') correo: string,
    @Body('nombre') nombre: string,
    @Body('monto') monto: number,
  ) {
    return this.service.notifyDeudaPendiente(estudianteId, correo, nombre, monto);
  }

  @Post('documento-generado')
  @HttpCode(200)
  notifyDocumentoGenerado(
    @Body('estudianteId') estudianteId: number,
    @Body('correo') correo: string,
    @Body('nombre') nombre: string,
    @Body('tipoDoc') tipoDoc: string,
  ) {
    return this.service.notifyDocumentoGenerado(estudianteId, correo, nombre, tipoDoc);
  }
}
