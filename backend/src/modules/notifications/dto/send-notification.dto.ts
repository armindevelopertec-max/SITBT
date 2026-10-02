import { IsString, IsOptional, IsNumber, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendEmailDto {
  @ApiProperty()
  @IsString()
  to: string;

  @ApiProperty()
  @IsString()
  subject: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  attachments?: { filename: string; path: string }[];
}

export class SendNotificationDto {
  @ApiProperty()
  @IsNumber()
  estudianteId: number;

  @ApiProperty()
  @IsString()
  tipo: string;

  @ApiProperty()
  @IsString()
  mensaje: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;
}
