import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentoEmitido } from '../../entidades/documento-emitido.entidad';
import { ServicioDocumentos } from './documentos.servicio';
import { ControladorDocumentos } from './documentos.controlador';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentoEmitido])],
  controllers: [ControladorDocumentos],
  providers: [ServicioDocumentos],
  exports: [ServicioDocumentos],
})
export class ModuloDocumentos {}
