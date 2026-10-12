import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsentRecord } from '../../entities/consent-record.entity';
import { ServicioConsentimiento } from './consentimiento.service';
import { ControladorConsentimiento } from './consentimiento.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ConsentRecord])],
  controllers: [ControladorConsentimiento],
  providers: [ServicioConsentimiento],
  exports: [ServicioConsentimiento],
})
export class ModuloConsentimiento {}
