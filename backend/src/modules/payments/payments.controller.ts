import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';
import { PaymentStatus } from '../../entities/pago.entity';

@ApiTags('Pagos')
@Controller('pagos')
@UseGuards(GuardaJwt)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Post()
  create(@Body() createDto: CreatePaymentDto) {
    return this.service.create(createDto);
  }

  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('gestion') gestion?: string,
    @Query('status') status?: PaymentStatus,
    @Query('studentId') studentId?: number,
    @Query('conceptId') conceptId?: number,
  ) {
    return this.service.findAll(
      +page,
      +limit,
      gestion,
      status,
      studentId ? +studentId : undefined,
      conceptId ? +conceptId : undefined,
    );
  }

  @Get('student/:studentId')
  findByStudent(@Param('studentId', ParseIntPipe) studentId: number, @Query('gestion') gestion?: string) {
    return this.service.findByStudent(studentId, gestion);
  }

  @Get('student/:studentId/debt')
  getStudentDebt(@Param('studentId', ParseIntPipe) studentId: number, @Query('gestion') gestion: string) {
    return this.service.getStudentDebt(studentId, gestion);
  }

  @Get('daily-collection')
  getDailyCollection(@Query('fecha') fecha: string, @Query('gestion') gestion: string) {
    return this.service.getDailyCollection(fecha, gestion);
  }

  @Get('summary/:gestion')
  getCollectionSummary(@Param('gestion') gestion: string) {
    return this.service.getCollectionSummary(gestion);
  }

  @Get('date-range')
  getPaymentsByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('gestion') gestion?: string,
  ) {
    return this.service.getPaymentsByDateRange(new Date(startDate), new Date(endDate), gestion);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdatePaymentDto) {
    return this.service.update(id, updateDto);
  }

  @Patch(':id/annul')
  annul(@Param('id', ParseIntPipe) id: number) {
    return this.service.annul(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}