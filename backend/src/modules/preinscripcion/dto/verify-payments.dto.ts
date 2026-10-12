import { IsInt, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VerifyPaymentsDto {
  @ApiProperty()
  @IsInt()
  studentId: number;

  @ApiProperty()
  @IsString()
  gestion: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  periodo?: string;
}

export class CheckPaymentResult {
  canEnroll: boolean;
  missingPayments: {
    type: string;
    concept: string;
    amount: number;
  }[];
  paidPayments: {
    type: string;
    concept: string;
    amount: number;
    paymentDate: Date;
  }[];
  isNewStudent: boolean;
}
