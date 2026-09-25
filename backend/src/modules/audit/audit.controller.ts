import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Auditoria')
@Controller('auditoria')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AuditController {
  constructor(private readonly service: AuditService) {}

  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 50,
    @Query('userId') userId?: number,
    @Query('action') action?: string,
    @Query('table') table?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.service.findAll(
      +page,
      +limit,
      userId ? +userId : undefined,
      action,
      table,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('user/:userId')
  findByUser(@Param('userId', ParseIntPipe) userId: number, @Query('limit') limit = 50) {
    return this.service.findByUser(userId, +limit);
  }

  @Get('table/:tableName')
  findByTable(@Param('tableName') tableName: string, @Query('limit') limit = 50) {
    return this.service.findByTable(tableName, +limit);
  }

  @Get('record/:tableName/:recordId')
  findByRecord(@Param('tableName') tableName: string, @Param('recordId', ParseIntPipe) recordId: number) {
    return this.service.findByRecord(tableName, recordId);
  }

  @Get('recent')
  getRecentActions(@Query('limit') limit = 20) {
    return this.service.getRecentActions(+limit);
  }

  @Get('stats')
  getActionStats(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.service.getActionStats(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }
}