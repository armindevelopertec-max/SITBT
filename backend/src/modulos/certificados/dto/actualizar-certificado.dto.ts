import { PartialType } from '@nestjs/swagger';
import { CrearCertificadoDto } from './crear-certificado.dto';

export class ActualizarCertificadoDto extends PartialType(CrearCertificadoDto) {}