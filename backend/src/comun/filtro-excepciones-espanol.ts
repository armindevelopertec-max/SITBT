import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * Filtro global de excepciones que devuelve las respuestas de error
 * con claves en español: { codigoEstado, mensaje }.
 */
@Catch()
export class FiltroExcepcionesEspanol implements ExceptionFilter {
  private readonly registrador = new Logger('Excepciones');

  catch(excepcion: unknown, anfitrion: ArgumentsHost) {
    const contexto = anfitrion.switchToHttp();
    const respuestaHttp = contexto.getResponse<Response>();

    const codigoEstado =
      excepcion instanceof HttpException
        ? excepcion.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let mensaje: string = 'Error interno del servidor';

    if (excepcion instanceof HttpException) {
      const respuesta = excepcion.getResponse();
      if (typeof respuesta === 'string') {
        mensaje = respuesta;
      } else if (respuesta && typeof respuesta === 'object') {
        const posible =
          (respuesta as any).mensaje ?? (respuesta as any).message;
        mensaje = Array.isArray(posible)
          ? posible.join(', ')
          : posible ?? excepcion.message;
      } else {
        mensaje = excepcion.message;
      }
    } else if (excepcion instanceof Error) {
      // Los errores no controlados se registran, pero al cliente se le
      // devuelve un mensaje genérico en español (sin filtrar detalles
      // técnicos que suelen venir en inglés desde las librerías).
      mensaje = 'Error interno del servidor';
    }

    if (codigoEstado >= 500) {
      this.registrador.error(
        excepcion instanceof Error ? excepcion.message : String(excepcion),
        excepcion instanceof Error ? excepcion.stack : undefined,
      );
    }

    respuestaHttp.status(codigoEstado).json({
      codigoEstado,
      mensaje,
    });
  }
}
