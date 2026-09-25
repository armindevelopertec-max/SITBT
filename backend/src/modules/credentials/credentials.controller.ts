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
import { CredentialsService } from './credentials.service';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { UpdateCredentialDto } from './dto/update-credential.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CredentialStatus } from '../../entities/credencial.entity';

@ApiTags('Credenciales')
@Controller('credenciales')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CredentialsController {
  constructor(private readonly service: CredentialsService) {}

  @Post()
  create(@Body() createDto: CreateCredentialDto) {
    return this.service.create(createDto);
  }

  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('gestion') gestion?: string,
    @Query('status') status?: CredentialStatus,
  ) {
    return this.service.findAll(+page, +limit, gestion, status);
  }

  @Get('student/:studentId')
  findByStudent(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.service.findByStudent(studentId);
  }

  @Get('student/:studentId/active')
  findActiveByStudent(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.service.findActiveByStudent(studentId);
  }

  @Get('code/:code')
  findByCode(@Param('code') code: string) {
    return this.service.findByCode(code);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateCredentialDto) {
    return this.service.update(id, updateDto);
  }

  @Patch(':id/mark-printed')
  markAsPrinted(@Param('id', ParseIntPipe) id: number) {
    return this.service.markAsPrinted(id);
  }

  @Patch(':id/annul')
  annul(@Param('id', ParseIntPipe) id: number) {
    return this.service.annul(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}