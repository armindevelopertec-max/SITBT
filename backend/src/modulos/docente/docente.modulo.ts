import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicioDocente } from './docente.servicio';
import { ControladorDocente } from './docente.controlador';
import { Usuario } from '../../entidades/usuario.entidad';
import { Personal } from '../../entidades/personal.entidad';
import { AsignacionDocente } from '../../entidades/asignacion-docente.entidad';
import { InscripcionMateria } from '../../entidades/inscripcion-materia.entidad';
import { ModuloMateriasImpartidas } from '../materias-impartidas/materias-impartidas.modulo';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Usuario,
      Personal,
      AsignacionDocente,
      InscripcionMateria,
    ]),
    ModuloMateriasImpartidas,
  ],
  controllers: [ControladorDocente],
  providers: [ServicioDocente],
  exports: [ServicioDocente],
})
export class ModuloDocente {}
