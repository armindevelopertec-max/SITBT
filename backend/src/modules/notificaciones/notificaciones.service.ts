import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ServicioNotificaciones {
  private readonly registrador = new Logger(ServicioNotificaciones.name);

  async enviarCorreo(para: string, asunto: string, contenido: string): Promise<boolean> {
    this.registrador.log(`Correo deshabilitado. Se enviaría a ${para}: ${asunto}`);
    return true;
  }

  async notificarPreRegistroAceptado(estudianteId: number, correo: string, nombre: string): Promise<boolean> {
    this.registrador.log(`Notificación: Pre-registro aceptado para ${nombre} (${correo})`);
    return true;
  }

  async notificarPagoConfirmado(estudianteId: number, correo: string, nombre: string, monto: number): Promise<boolean> {
    this.registrador.log(`Notificación: Pago confirmado de ${monto} Bs para ${nombre} (${correo})`);
    return true;
  }

  async notificarCarnetListo(estudianteId: number, correo: string, nombre: string): Promise<boolean> {
    this.registrador.log(`Notificación: Carnet listo para ${nombre} (${correo})`);
    return true;
  }

  async notificarDeudaPendiente(estudianteId: number, correo: string, nombre: string, monto: number): Promise<boolean> {
    this.registrador.log(`Notificación: Deuda pendiente de ${monto} Bs para ${nombre} (${correo})`);
    return true;
  }

  async notificarDocumentoGenerado(estudianteId: number, correo: string, nombre: string, tipoDoc: string): Promise<boolean> {
    this.registrador.log(`Notificación: ${tipoDoc} generado para ${nombre} (${correo})`);
    return true;
  }
}
