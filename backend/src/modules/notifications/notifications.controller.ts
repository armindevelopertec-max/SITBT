import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { SendEmailDto, SendNotificationDto } from './dto/send-notification.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';

@ApiTags('Notificaciones')
@Controller('notifications')
@UseGuards(GuardaJwt)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Post('email')
  @HttpCode(200)
  sendEmail(@Body() dto: SendEmailDto) {
    return this.service.sendEmail(dto.to, dto.subject, dto.content);
  }

  @Post('pre-registro-aceptado')
  @HttpCode(200)
  notifyPreRegistroAceptado(
    @Body('estudianteId') estudianteId: number,
    @Body('email') email: string,
    @Body('nombre') nombre: string,
  ) {
    return this.service.notifyPreRegistroAceptado(estudianteId, email, nombre);
  }

  @Post('pago-confirmado')
  @HttpCode(200)
  notifyPagoConfirmado(
    @Body('estudianteId') estudianteId: number,
    @Body('email') email: string,
    @Body('nombre') nombre: string,
    @Body('monto') monto: number,
  ) {
    return this.service.notifyPagoConfirmado(estudianteId, email, nombre, monto);
  }

  @Post('carnet-listo')
  @HttpCode(200)
  notifyCarnetListo(
    @Body('estudianteId') estudianteId: number,
    @Body('email') email: string,
    @Body('nombre') nombre: string,
  ) {
    return this.service.notifyCarnetListo(estudianteId, email, nombre);
  }

  @Post('deuda-pendiente')
  @HttpCode(200)
  notifyDeudaPendiente(
    @Body('estudianteId') estudianteId: number,
    @Body('email') email: string,
    @Body('nombre') nombre: string,
    @Body('monto') monto: number,
  ) {
    return this.service.notifyDeudaPendiente(estudianteId, email, nombre, monto);
  }

  @Post('documento-generado')
  @HttpCode(200)
  notifyDocumentoGenerado(
    @Body('estudianteId') estudianteId: number,
    @Body('email') email: string,
    @Body('nombre') nombre: string,
    @Body('tipoDoc') tipoDoc: string,
  ) {
    return this.service.notifyDocumentoGenerado(estudianteId, email, nombre, tipoDoc);
  }
}
