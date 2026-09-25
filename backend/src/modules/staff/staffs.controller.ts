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
import { StaffsService } from './staffs.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StaffStatus, StaffPosition } from '../../entities/personal.entity';

@ApiTags('Personal')
@Controller('personal')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StaffsController {
  constructor(private readonly staffsService: StaffsService) {}

  @Post()
  create(@Body() createStaffDto: CreateStaffDto) {
    return this.staffsService.create(createStaffDto);
  }

  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: StaffStatus,
    @Query('position') position?: StaffPosition,
  ) {
    return this.staffsService.findAll(+page, +limit, status, position);
  }

  @Get('active')
  findActive() {
    return this.staffsService.findActive();
  }

  @Get('teachers')
  findTeachers() {
    return this.staffsService.findTeachers();
  }

  @Get('by-position/:position')
  findByPosition(@Param('position') position: StaffPosition) {
    return this.staffsService.findByPosition(position);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.staffsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateStaffDto: UpdateStaffDto) {
    return this.staffsService.update(id, updateStaffDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.staffsService.remove(id);
  }
}