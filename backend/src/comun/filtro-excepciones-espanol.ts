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
 * Códigos de error de PostgreSQL que se traducen a respuestas claras.
 * https://www.postgresql.org/docs/current/errcodes-appendix.html
 */
const CODIGO_VIOLACION_LLAVE_FORANEA = '23503';
const CODIGO_VIOLACION_UNICIDAD = '23505';
const CODIGO_NULO_NO_PERMITIDO = '23502';

/** Extrae el código de error nativo de PostgreSQL desde un QueryFailedError de TypeORM. */
function obtenerCodigoPostgres(excepcion: unknown): string | undefined {
  if (excepcion && typeof excepcion === 'object') {
    const errorControlador = (excepcion as any).driverError;
    if (errorControlador && typeof errorControlador.code === 'string') {
      return errorControlador.code;
    }
  }
  return undefined;
}

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

    let codigoEstado =
      excepcion instanceof HttpException
        ? excepcion.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let mensaje: string = 'Error interno del servidor';
    let manejado = false;

    // Errores de integridad de PostgreSQL: se traducen a mensajes claros
    // en lugar del genérico "Error interno del servidor".
    const codigoPostgres = obtenerCodigoPostgres(excepcion);
    if (codigoPostgres) {
      manejado = true;
      switch (codigoPostgres) {
        case CODIGO_VIOLACION_LLAVE_FORANEA:
          codigoEstado = HttpStatus.CONFLICT;
          mensaje =
            'No se puede completar la operación porque el registro está relacionado con otros registros. ' +
            'Elimine o reasigne primero los registros asociados.';
          this.registrador.warn(
            `Violación de llave foránea: ${excepcion instanceof Error ? excepcion.message : String(excepcion)}`,
          );
          break;
        case CODIGO_VIOLACION_UNICIDAD:
          codigoEstado = HttpStatus.CONFLICT;
          mensaje =
            'Ya existe un registro con esos datos. Verifique los valores duplicados e intente nuevamente.';
          this.registrador.warn(
            `Violación de unicidad: ${excepcion instanceof Error ? excepcion.message : String(excepcion)}`,
          );
          break;
        case CODIGO_NULO_NO_PERMITIDO:
          codigoEstado = HttpStatus.BAD_REQUEST;
          mensaje = 'Faltan datos obligatorios para completar la operación.';
          break;
        default:
          manejado = false;
      }
    }

    if (!manejado && excepcion instanceof HttpException) {
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
    } else if (!manejado && excepcion instanceof Error) {
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
