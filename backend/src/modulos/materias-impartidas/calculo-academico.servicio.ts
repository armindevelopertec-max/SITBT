import { Injectable } from '@nestjs/common';
import {
  EstadoRegistroNota,
  EstadoCalificacionRegular,
  EstadoCalificacion2T,
  EstadoCalificacionDefinitivo,
} from '../../entidades/calificacion.entidad';

/** Nota mínima para aprobar directamente (y para aprobar en 2T). */
export const NOTA_APROBACION = 61;
/** Nota mínima para acceder al segundo turno. */
export const NOTA_MINIMA_2T = 40;

/** Códigos internos de observación (el frontend los muestra en español). */
export type CodigoObservacion =
  | 'aprobo'
  | 'reprobo'
  | 'no_se_presento'
  | 'puede_ir_2t'
  | 'pendiente';

export interface DatosCalificacion {
  parcial1: number | null;
  parcial1Estado: EstadoRegistroNota;
  parcial2: number | null;
  parcial2Estado: EstadoRegistroNota;
  estado2T: EstadoCalificacion2T;
  notaSegundaTurno: number | null;
}

export interface ResultadoAcademico {
  promedioSemestral: number | null;
  estadoRegular: EstadoCalificacionRegular;
  observacion: CodigoObservacion;
  habilitado2T: boolean;
  estado2T: EstadoCalificacion2T;
  notaDefinitiva: number | null;
  estadoDefinitivo: EstadoCalificacionDefinitivo;
  /** Verdadero cuando el resultado final ya está resuelto (permite cerrar). */
  completo: boolean;
  mensaje: string;
}

/**
 * Reglas de cálculo académico (confirmadas por la institución):
 * - El promedio semestral es el promedio aritmético de los dos parciales.
 * - 61 o más: aprueba directamente.
 * - 40 a 60: puede ir a segundo turno.
 * - menos de 40: reprueba.
 * - La nota del segundo turno reemplaza al promedio para el resultado final.
 * - Si falta un parcial, el resultado queda PENDIENTE (no se calcula).
 */
@Injectable()
export class ServicioCalculoAcademico {
  private valorResuelto(valor: number | null, estado: EstadoRegistroNota): number | null {
    if (estado === EstadoRegistroNota.REGISTRADO) {
      return valor ?? 0;
    }
    if (estado === EstadoRegistroNota.AUSENTE) {
      return 0;
    }
    return null;
  }

  calcular(datos: DatosCalificacion): ResultadoAcademico {
    const valor1 = this.valorResuelto(datos.parcial1, datos.parcial1Estado);
    const valor2 = this.valorResuelto(datos.parcial2, datos.parcial2Estado);

    const pendiente: ResultadoAcademico = {
      promedioSemestral: null,
      estadoRegular: EstadoCalificacionRegular.PENDIENTE,
      observacion: 'pendiente',
      habilitado2T: false,
      estado2T: EstadoCalificacion2T.NO_CORRESPONDE,
      notaDefinitiva: null,
      estadoDefinitivo: EstadoCalificacionDefinitivo.PENDIENTE,
      completo: false,
      mensaje: 'Falta registrar uno de los parciales.',
    };

    if (valor1 === null || valor2 === null) {
      return pendiente;
    }

    if (valor1 <= 0 && valor2 <= 0) {
      return {
        promedioSemestral: 0,
        estadoRegular: EstadoCalificacionRegular.NO_PRESENTO,
        observacion: 'no_se_presento',
        habilitado2T: false,
        estado2T: EstadoCalificacion2T.NO_CORRESPONDE,
        notaDefinitiva: 0,
        estadoDefinitivo: EstadoCalificacionDefinitivo.NO_PRESENTO,
        completo: true,
        mensaje: 'No se presentó: ambos parciales en cero.',
      };
    }

    const promedio = Math.round((valor1 + valor2) / 2);

    let estadoRegular: EstadoCalificacionRegular;
    let observacion: CodigoObservacion;
    if (promedio >= NOTA_APROBACION) {
      estadoRegular = EstadoCalificacionRegular.APROBADO;
      observacion = 'aprobo';
    } else if (promedio >= NOTA_MINIMA_2T) {
      estadoRegular = EstadoCalificacionRegular.PUEDE_IR_2T;
      observacion = 'puede_ir_2t';
    } else {
      estadoRegular = EstadoCalificacionRegular.REPROBADO;
      observacion = 'reprobo';
    }

    const habilitado2T = estadoRegular === EstadoCalificacionRegular.PUEDE_IR_2T;

    // El segundo turno reemplaza el resultado cuando está calificado.
    const resultado2T = this.resolverSegundaTurno(datos, promedio, estadoRegular, habilitado2T);
    if (resultado2T) {
      return resultado2T;
    }

    let estadoDefinitivo: EstadoCalificacionDefinitivo;
    if (estadoRegular === EstadoCalificacionRegular.APROBADO) {
      estadoDefinitivo = EstadoCalificacionDefinitivo.APROBADO;
    } else if (estadoRegular === EstadoCalificacionRegular.REPROBADO) {
      estadoDefinitivo = EstadoCalificacionDefinitivo.REPROBADO;
    } else {
      estadoDefinitivo = EstadoCalificacionDefinitivo.PENDIENTE;
    }

    return {
      promedioSemestral: promedio,
      estadoRegular,
      observacion,
      habilitado2T,
      estado2T: habilitado2T
        ? EstadoCalificacion2T.HABILITADO
        : EstadoCalificacion2T.NO_CORRESPONDE,
      notaDefinitiva: habilitado2T ? null : promedio,
      estadoDefinitivo,
      completo: !habilitado2T,
      mensaje: habilitado2T
        ? 'Puede ir a segundo turno.'
        : estadoRegular === EstadoCalificacionRegular.APROBADO
          ? 'Aprobado.'
          : 'Reprobado.',
    };
  }

  private resolverSegundaTurno(
    datos: DatosCalificacion,
    promedio: number,
    estadoRegular: EstadoCalificacionRegular,
    habilitado2T: boolean,
  ): ResultadoAcademico | null {
    const base = {
      promedioSemestral: promedio,
      estadoRegular,
      habilitado2T,
    };

    if (datos.estado2T === EstadoCalificacion2T.CALIFICADO && datos.notaSegundaTurno != null) {
      const nota = datos.notaSegundaTurno;
      const aprobado = nota >= NOTA_APROBACION;
      return {
        ...base,
        observacion: aprobado ? 'aprobo' : 'reprobo',
        habilitado2T: true,
        estado2T: EstadoCalificacion2T.CALIFICADO,
        notaDefinitiva: nota,
        estadoDefinitivo: aprobado
          ? EstadoCalificacionDefinitivo.APROBADO
          : EstadoCalificacionDefinitivo.REPROBADO,
        completo: true,
        mensaje: 'Resultado definido por el segundo turno.',
      };
    }

    if (datos.estado2T === EstadoCalificacion2T.AUSENTE) {
      return {
        ...base,
        observacion: 'no_se_presento',
        habilitado2T: true,
        estado2T: EstadoCalificacion2T.AUSENTE,
        notaDefinitiva: null,
        estadoDefinitivo: EstadoCalificacionDefinitivo.NO_PRESENTO,
        completo: true,
        mensaje: 'No se presentó al segundo turno.',
      };
    }

    if (datos.estado2T === EstadoCalificacion2T.JUSTIFICADO) {
      return {
        ...base,
        observacion: 'pendiente',
        habilitado2T: true,
        estado2T: EstadoCalificacion2T.JUSTIFICADO,
        notaDefinitiva: null,
        estadoDefinitivo: EstadoCalificacionDefinitivo.PENDIENTE,
        completo: false,
        mensaje: 'Segundo turno justificado: requiere resolución.',
      };
    }

    return null;
  }
}
