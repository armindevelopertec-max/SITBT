import { PartialType } from '@nestjs/swagger';
import { CreateConvalidationDto } from './create-convalidation.dto';

export class UpdateConvalidationDto extends PartialType(CreateConvalidationDto) {}