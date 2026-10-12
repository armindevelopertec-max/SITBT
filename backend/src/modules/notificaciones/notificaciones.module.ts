import { Module } from '@nestjs/common';
import { ServicioNotificaciones } from './notificaciones.service';
import { ControladorNotificaciones } from './notificaciones.controller';

@Module({
  controllers: [ControladorNotificaciones],
  providers: [ServicioNotificaciones],
  exports: [ServicioNotificaciones],
})
export class ModuloNotificaciones {}
