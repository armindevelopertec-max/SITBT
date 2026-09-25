import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [StorageController],
  providers: [StorageService, ConfigService],
  exports: [StorageService],
})
export class StorageModule {}