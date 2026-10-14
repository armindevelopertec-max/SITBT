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
  private readonly logger = new Logger('Excepciones');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const codigoEstado =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let mensaje: string = 'Error interno del servidor';

    if (exception instanceof HttpException) {
      const respuesta = exception.getResponse();
      if (typeof respuesta === 'string') {
        mensaje = respuesta;
      } else if (respuesta && typeof respuesta === 'object') {
        const posible =
          (respuesta as any).mensaje ?? (respuesta as any).message;
        mensaje = Array.isArray(posible)
          ? posible.join(', ')
          : posible ?? exception.message;
      } else {
        mensaje = exception.message;
      }
    } else if (exception instanceof Error) {
      mensaje = exception.message;
    }

    if (codigoEstado >= 500) {
      this.logger.error(
        exception instanceof Error ? exception.message : String(exception),
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(codigoEstado).json({
      codigoEstado,
      mensaje,
    });
  }
}
