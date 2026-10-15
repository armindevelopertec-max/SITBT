import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistroConsentimiento } from '../../entidades/registro-consentimiento.entidad';
import { ServicioConsentimiento } from './consentimiento.servicio';
import { ControladorConsentimiento } from './consentimiento.controlador';

@Module({
  imports: [TypeOrmModule.forFeature([RegistroConsentimiento])],
  controllers: [ControladorConsentimiento],
  providers: [ServicioConsentimiento],
  exports: [ServicioConsentimiento],
})
export class ModuloConsentimiento {}
