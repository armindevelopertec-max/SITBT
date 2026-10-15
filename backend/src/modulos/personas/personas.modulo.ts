import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Persona } from '../../entidades/persona.entidad';
import { ServicioPersonas } from './personas.servicio';
import { ControladorPersonas } from './personas.controlador';

@Module({
  imports: [TypeOrmModule.forFeature([Persona])],
  controllers: [ControladorPersonas],
  providers: [ServicioPersonas],
  exports: [ServicioPersonas],
})
export class ModuloPersonas {}