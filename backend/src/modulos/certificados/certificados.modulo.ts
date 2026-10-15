import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Certificado } from '../../entidades/certificado.entidad';
import { ServicioCertificados } from './certificados.servicio';
import { ControladorCertificados } from './certificados.controlador';
import { Estudiante } from '../../entidades/estudiante.entidad';
import { Usuario } from '../../entidades/usuario.entidad';

@Module({
  imports: [TypeOrmModule.forFeature([Certificado, Estudiante, Usuario])],
  controllers: [ControladorCertificados],
  providers: [ServicioCertificados],
  exports: [ServicioCertificados],
})
export class ModuloCertificados {}