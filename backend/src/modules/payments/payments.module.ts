import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pago } from '../../entities/pago.entity';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Estudiante } from '../../entities/estudiante.entity';
import { ConceptoPago } from '../../entities/concepto-pago.entity';
import { Usuario } from '../../entities/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pago, Estudiante, ConceptoPago, Usuario])],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}