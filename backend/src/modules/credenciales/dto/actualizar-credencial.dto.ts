import { PartialType } from '@nestjs/swagger';
import { CrearCredencialDto } from './crear-credencial.dto';

export class ActualizarCredencialDto extends PartialType(CrearCredencialDto) {}