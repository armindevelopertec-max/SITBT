import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Personal } from '../../entities/personal.entity';
import { ServicioPersonal } from './personal.service';
import { ControladorPersonal } from './personal.controller';
import { Persona } from '../../entities/persona.entity';
import { Usuario } from '../../entities/usuario.entity';
import { UsuarioRol } from '../../entities/usuario-rol.entity';
import { Rol } from '../../entities/rol.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Personal, Persona, Usuario, UsuarioRol, Rol])],
  controllers: [ControladorPersonal],
  providers: [ServicioPersonal],
  exports: [ServicioPersonal],
})
export class ModuloPersonal {}