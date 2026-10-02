import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  async sendEmail(to: string, subject: string, content: string): Promise<boolean> {
    this.logger.log(`Email disabled. Would send to ${to}: ${subject}`);
    return true;
  }

  async notifyPreRegistroAceptado(estudianteId: number, email: string, nombre: string): Promise<boolean> {
    this.logger.log(`Notification: Pre-registro aceptado para ${nombre} (${email})`);
    return true;
  }

  async notifyPagoConfirmado(estudianteId: number, email: string, nombre: string, monto: number): Promise<boolean> {
    this.logger.log(`Notification: Pago confirmado de ${monto} Bs para ${nombre} (${email})`);
    return true;
  }

  async notifyCarnetListo(estudianteId: number, email: string, nombre: string): Promise<boolean> {
    this.logger.log(`Notification: Carnet listo para ${nombre} (${email})`);
    return true;
  }

  async notifyDeudaPendiente(estudianteId: number, email: string, nombre: string, monto: number): Promise<boolean> {
    this.logger.log(`Notification: Deuda pendiente de ${monto} Bs para ${nombre} (${email})`);
    return true;
  }

  async notifyDocumentoGenerado(estudianteId: number, email: string, nombre: string, tipoDoc: string): Promise<boolean> {
    this.logger.log(`Notification: ${tipoDoc} generado para ${nombre} (${email})`);
    return true;
  }
}
