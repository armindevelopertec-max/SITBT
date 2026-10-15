import { PartialType } from '@nestjs/swagger';
import { CrearPlanEstudioDto } from './crear-plan-estudio.dto';

export class ActualizarPlanEstudioDto extends PartialType(CrearPlanEstudioDto) {}