import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PreinscripcionService } from './preinscripcion.service';
import { VerifyPaymentsDto } from './dto/verify-payments.dto';
import { CalculateSubjectsDto } from './dto/calculate-subjects.dto';
import { CreateEnrollmentBatchDto } from './dto/create-enrollment-batch.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Preinscripcion')
@Controller('preinscripcion')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PreinscripcionController {
  constructor(private readonly service: PreinscripcionService) {}

  @Post('verify-payments')
  verifyPayments(@Body() dto: VerifyPaymentsDto) {
    return this.service.verifyPayments(dto);
  }

  @Post('calculate-subjects')
  calculateSubjects(@Body() dto: CalculateSubjectsDto) {
    return this.service.calculateSubjects(dto);
  }

  @Post('enroll-batch')
  createEnrollmentBatch(@Body() dto: CreateEnrollmentBatchDto) {
    return this.service.createEnrollmentBatch(dto);
  }

  @Get('boleta')
  getEnrollmentBoleta(
    @Query('estudianteId') estudianteId: number,
    @Query('gestion') gestion: string,
    @Query('periodo') periodo?: string,
  ) {
    return this.service.getEnrollmentBoleta(estudianteId, gestion, periodo);
  }

  @Get('groups')
  getGroupsByCareerAndSemester(
    @Query('careerId') careerId: number,
    @Query('gestion') gestion: string,
    @Query('semester') semester: number,
    @Query('shiftId') shiftId?: number,
  ) {
    return this.service.getGroupsByCareerAndSemester(careerId, gestion, semester, shiftId ? +shiftId : undefined);
  }

  @Get('open-periodo')
  getOpenPeriodo(@Query('gestion') gestion: string) {
    return this.service.getOpenPeriodo(gestion);
  }
}
