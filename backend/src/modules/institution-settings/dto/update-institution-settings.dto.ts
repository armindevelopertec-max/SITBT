import { PartialType } from '@nestjs/swagger';
import { CreateInstitutionSettingsDto } from './create-institution-settings.dto';

export class UpdateInstitutionSettingsDto extends PartialType(CreateInstitutionSettingsDto) {}
