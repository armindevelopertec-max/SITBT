import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ActualizarLogoDto {
  @ApiPropertyOptional({
    description: 'URL del logo institucional. Enviar vacío para quitarlo.',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  logoUrl?: string;
}
