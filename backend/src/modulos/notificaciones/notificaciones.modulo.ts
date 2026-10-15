import { Module } from '@nestjs/common';
import { ServicioNotificaciones } from './notificaciones.servicio';
import { ControladorNotificaciones } from './notificaciones.controlador';

@Module({
  controllers: [ControladorNotificaciones],
  providers: [ServicioNotificaciones],
  exports: [ServicioNotificaciones],
})
export class ModuloNotificaciones {}
