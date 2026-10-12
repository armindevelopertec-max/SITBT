import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmittedDocument } from '../../entities/emitted-document.entity';
import { ServicioDocumentos } from './documentos.service';
import { ControladorDocumentos } from './documentos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EmittedDocument])],
  controllers: [ControladorDocumentos],
  providers: [ServicioDocumentos],
  exports: [ServicioDocumentos],
})
export class ModuloDocumentos {}
