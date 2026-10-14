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
import { VerificarPagosDto } from './dto/verify-payments.dto';
import { CalcularMateriasDto } from './dto/calculate-subjects.dto';
import { CrearInscripcionLoteDto } from './dto/create-enrollment-batch.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';

@ApiTags('Preinscripcion')
@Controller('preinscripcion')
@UseGuards(GuardaJwt)
@ApiBearerAuth()
export class PreinscripcionController {
  constructor(private readonly service: PreinscripcionService) {}

  @Post('verificar-pagos')
  verifyPayments(@Body() dto: VerificarPagosDto) {
    return this.service.verifyPayments(dto);
  }

  @Post('calcular-materias')
  calculateSubjects(@Body() dto: CalcularMateriasDto) {
    return this.service.calculateSubjects(dto);
  }

  @Post('inscribir-lote')
  createEnrollmentBatch(@Body() dto: CrearInscripcionLoteDto) {
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

  @Get('grupos')
  getGroupsByCareerAndSemester(
    @Query('carreraId') careerId: number,
    @Query('gestion') gestion: string,
    @Query('semestre') semester: number,
    @Query('turnoId') shiftId?: number,
  ) {
    return this.service.getGroupsByCareerAndSemester(careerId, gestion, semester, shiftId ? +shiftId : undefined);
  }

  @Get('abrir-periodo')
  getOpenPeriodo(@Query('gestion') gestion: string) {
    return this.service.getOpenPeriodo(gestion);
  }
}
