import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentoEmitido } from '../../entities/emitted-document.entity';
import { ServicioDocumentos } from './documentos.service';
import { ControladorDocumentos } from './documentos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentoEmitido])],
  controllers: [ControladorDocumentos],
  providers: [ServicioDocumentos],
  exports: [ServicioDocumentos],
})
export class ModuloDocumentos {}
