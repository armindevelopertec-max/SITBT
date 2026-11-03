import { Injectable } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sharp = require('sharp');

export interface ImagenOptimizada {
  buffer: Buffer;
  tipoMime: string;
  extension: string;
  ancho: number;
  alto: number;
  pesoOriginal: number;
  pesoOptimizado: number;
}

/**
 * Optimiza imágenes antes de guardarlas en el almacenamiento.
 *
 * El logo institucional se muestra en pantallas pequeñas (36 px en el
 * encabezado), así que no necesita la resolución ni los miles de colores del
 * archivo original. Convertirlo a WebP y reducirlo a 256 px baja el peso de
 * más de 1 MB a unos 18 KB sin que se note la diferencia a pantalla.
 */
@Injectable()
export class ServicioOptimizacionImagen {
  /** Lado máximo, en píxeles, de la imagen optimizada. */
  private readonly ladoMaximo = 256;

  /** Calidad de la conversión WebP. */
  private readonly calidad = 90;

  /**
   * Optimiza una imagen. Si el formato no es compatible, la carpeta no es la
   * de logos o la optimización no aporta, se devuelve el archivo original.
   */
  async optimizar(
    buffer: Buffer,
    tipoMime: string,
    carpeta: string = 'general',
  ): Promise<ImagenOptimizada> {
    const original: ImagenOptimizada = {
      buffer,
      tipoMime,
      extension: this.extensionDe(tipoMime),
      ancho: 0,
      alto: 0,
      pesoOriginal: buffer.length,
      pesoOptimizado: buffer.length,
    };

    const esImagen = ['image/png', 'image/jpeg', 'image/webp'].includes(tipoMime);
    const esLogo = carpeta.toLowerCase() === 'logos';

    if (!esImagen || !esLogo) return original;

    try {
      const { data, info } = await sharp(buffer, { failOn: 'none' })
        .resize({
          width: this.ladoMaximo,
          height: this.ladoMaximo,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: this.calidad, effort: 6, alphaQuality: 100 })
        .toBuffer({ resolveWithObject: true });

      // Si la optimización no aporta, se conserva el archivo original.
      if (data.length >= buffer.length) return original;

      return {
        buffer: data,
        tipoMime: 'image/webp',
        extension: 'webp',
        ancho: info.width,
        alto: info.height,
        pesoOriginal: buffer.length,
        pesoOptimizado: data.length,
      };
    } catch (error) {
      console.warn(
        'No se pudo optimizar la imagen, se guarda el original:',
        (error as Error).message,
      );
      return original;
    }
  }

  private extensionDe(tipoMime: string): string {
    if (tipoMime === 'image/png') return 'png';
    if (tipoMime === 'image/jpeg') return 'jpg';
    if (tipoMime === 'image/webp') return 'webp';
    return 'bin';
  }
}
