import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Certificado } from '../../entities/certificado.entity';
import { ServicioCertificados } from './certificados.service';
import { ControladorCertificados } from './certificados.controller';
import { Estudiante } from '../../entities/estudiante.entity';
import { Usuario } from '../../entities/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Certificado, Estudiante, Usuario])],
  controllers: [ControladorCertificados],
  providers: [ServicioCertificados],
  exports: [ServicioCertificados],
})
export class ModuloCertificados {}