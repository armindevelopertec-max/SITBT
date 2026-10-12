import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rol } from '../../entities/rol.entity';
import { ServicioRoles } from './roles.service';
import { ControladorRoles } from './roles.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Rol])],
  controllers: [ControladorRoles],
  providers: [ServicioRoles],
  exports: [ServicioRoles],
})
export class ModuloRoles {}