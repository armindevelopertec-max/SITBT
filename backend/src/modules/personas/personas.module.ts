import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Persona } from '../../entities/persona.entity';
import { ServicioPersonas } from './personas.service';
import { ControladorPersonas } from './personas.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Persona])],
  controllers: [ControladorPersonas],
  providers: [ServicioPersonas],
  exports: [ServicioPersonas],
})
export class ModuloPersonas {}