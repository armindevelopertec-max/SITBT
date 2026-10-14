import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistroConsentimiento } from '../../entities/consent-record.entity';
import { ServicioConsentimiento } from './consentimiento.service';
import { ControladorConsentimiento } from './consentimiento.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RegistroConsentimiento])],
  controllers: [ControladorConsentimiento],
  providers: [ServicioConsentimiento],
  exports: [ServicioConsentimiento],
})
export class ModuloConsentimiento {}
