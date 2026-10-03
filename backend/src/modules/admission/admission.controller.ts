import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  HttpCode,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AdmissionService } from './admission.service';
import { CreateAdmissionDto } from './dto/create-admission.dto';
import { UpdateAdmissionDto } from './dto/update-admission.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdmissionStatus } from '../../entities/admission-request.entity';

@ApiTags('Admisión')
@Controller('admission')
export class AdmissionController {
  constructor(private readonly service: AdmissionService) {}

  @Post()
  create(@Body() createDto: CreateAdmissionDto) {
    return this.service.create(createDto);
  }

  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('estado') estado?: AdmissionStatus,
    @Query('origen') origen?: string,
  ) {
    return this.service.findAll(+page, +limit, estado, origen);
  }

  @Get('statistics')
  getStatistics() {
    return this.service.getStatistics();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateAdmissionDto) {
    return this.service.update(id, updateDto);
  }

  @Post(':id/verify')
  @HttpCode(200)
  verify(
    @Param('id') id: string,
    @Body('verificadoPor') verificadoPor: number,
    @Body('observaciones') observaciones?: string,
  ) {
    return this.service.verify(id, verificadoPor, observaciones);
  }

  @Post(':id/reject')
  @HttpCode(200)
  reject(
    @Param('id') id: string,
    @Body('verificadoPor') verificadoPor: number,
    @Body('observaciones') observaciones: string,
  ) {
    return this.service.reject(id, verificadoPor, observaciones);
  }

  @Post(':id/convert-to-student')
  @HttpCode(200)
  convertToStudent(
    @Param('id') id: string,
    @Body('admissionGestion') admissionGestion: string,
  ) {
    return this.service.convertToStudent(id, admissionGestion);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
