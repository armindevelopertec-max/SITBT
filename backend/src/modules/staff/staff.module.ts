import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Personal } from '../../entities/personal.entity';
import { StaffsService } from './staffs.service';
import { StaffsController } from './staffs.controller';
import { Persona } from '../../entities/persona.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Personal, Persona])],
  controllers: [StaffsController],
  providers: [StaffsService],
  exports: [StaffsService],
})
export class StaffModule {}