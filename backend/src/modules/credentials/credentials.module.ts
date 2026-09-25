import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Credencial } from '../../entities/credencial.entity';
import { CredentialsService } from './credentials.service';
import { CredentialsController } from './credentials.controller';
import { Estudiante } from '../../entities/estudiante.entity';
import { Usuario } from '../../entities/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Credencial, Estudiante, Usuario])],
  controllers: [CredentialsController],
  providers: [CredentialsService],
  exports: [CredentialsService],
})
export class CredentialsModule {}