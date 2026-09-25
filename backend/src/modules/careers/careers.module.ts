import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Carrera } from '../../entities/carrera.entity';
import { CareersService } from './careers.service';
import { CareersController } from './careers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Carrera])],
  controllers: [CareersController],
  providers: [CareersService],
  exports: [CareersService],
})
export class CareersModule {}