import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Certificado } from '../../entities/certificado.entity';
import { CertificatesService } from './certificates.service';
import { CertificatesController } from './certificates.controller';
import { Estudiante } from '../../entities/estudiante.entity';
import { Usuario } from '../../entities/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Certificado, Estudiante, Usuario])],
  controllers: [CertificatesController],
  providers: [CertificatesService],
  exports: [CertificatesService],
})
export class CertificatesModule {}