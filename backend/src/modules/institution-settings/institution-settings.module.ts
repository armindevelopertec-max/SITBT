import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstitutionSettings } from '../../entities/institution-settings.entity';
import { InstitutionSettingsService } from './institution-settings.service';
import { InstitutionSettingsController } from './institution-settings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InstitutionSettings])],
  controllers: [InstitutionSettingsController],
  providers: [InstitutionSettingsService],
  exports: [InstitutionSettingsService],
})
export class InstitutionSettingsModule {}
