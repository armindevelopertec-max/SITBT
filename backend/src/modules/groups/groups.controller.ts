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
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GenerateGroupsDto } from './dto/generate-groups.dto';
import { GuardaJwt } from '../autenticacion/guarda-jwt';

@ApiTags('Grupos')
@Controller('grupos')
@UseGuards(GuardaJwt)
@ApiBearerAuth()
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  create(@Body() createGroupDto: CreateGroupDto) {
    return this.groupsService.create(createGroupDto);
  }

  @Post('generate')
  generate(@Body() generateGroupsDto: GenerateGroupsDto) {
    return this.groupsService.generateGroups(generateGroupsDto);
  }

  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('gestion') gestion?: string,
    @Query('careerId') careerId?: number,
    @Query('semester') semester?: number,
  ) {
    return this.groupsService.findAll(
      +page,
      +limit,
      gestion,
      careerId ? +careerId : undefined,
      semester ? +semester : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.findOne(id);
  }

  @Get(':id/students')
  getStudents(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.getStudents(id);
  }

  @Get(':id/stats')
  getGroupStats(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.getGroupStats(id);
  }

  @Get('by-career-shift')
  findByCareerAndShift(
    @Query('careerId') careerId: number,
    @Query('gestion') gestion: string,
    @Query('semester') semester: number,
    @Query('shiftId') shiftId: number,
  ) {
    return this.groupsService.findByCareerAndShift(+careerId, gestion, +semester, +shiftId);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateGroupDto: UpdateGroupDto) {
    return this.groupsService.update(id, updateGroupDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.remove(id);
  }

  @Post(':id/students/:studentId')
  addStudent(@Param('id', ParseIntPipe) id: number, @Param('studentId', ParseIntPipe) studentId: number) {
    return this.groupsService.addStudent(id, studentId);
  }

  @Delete(':id/students/:studentId')
  removeStudent(@Param('id', ParseIntPipe) id: number, @Param('studentId', ParseIntPipe) studentId: number) {
    return this.groupsService.removeStudent(id, studentId);
  }
}