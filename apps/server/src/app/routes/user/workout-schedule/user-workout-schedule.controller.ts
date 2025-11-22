import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { UserWorkoutScheduleService } from '../../../core/user/workout-schedule/user-workout-schedule.service';
import { UserId } from '../../../common/decorators/user-id.decorator';
import {
  CreateUserWorkoutScheduleDto,
  UpdateUserWorkoutScheduleDto,
} from './dto/user-workout-schedule.dto';

@Controller('user/workout-schedule')
export class UserWorkoutScheduleController {
  constructor(
    private readonly scheduleService: UserWorkoutScheduleService
  ) {}

  @Post()
  async createSchedule(
    @UserId() userId: string,
    @Body() createDto: CreateUserWorkoutScheduleDto
  ) {
    return this.scheduleService.createSchedule(
      userId,
      createDto.workoutTemplateId,
      createDto.dayOfWeek,
      createDto.order
    );
  }

  @Get()
  async getUserSchedules(
    @UserId() userId: string,
    @Query('dayOfWeek') dayOfWeek?: string
  ) {
    if (dayOfWeek !== undefined) {
      const day = parseInt(dayOfWeek, 10);
      if (isNaN(day) || day < 0 || day > 6) {
        throw new Error('Invalid dayOfWeek parameter. Must be between 0 and 6.');
      }
      return this.scheduleService.getUserSchedulesByDay(userId, day);
    }

    return this.scheduleService.getUserSchedules(userId);
  }

  @Get(':id')
  async getScheduleById(
    @UserId() userId: string,
    @Param('id') scheduleId: string
  ) {
    return this.scheduleService.getScheduleById(userId, scheduleId);
  }

  @Put(':id')
  async updateSchedule(
    @UserId() userId: string,
    @Param('id') scheduleId: string,
    @Body() updateDto: UpdateUserWorkoutScheduleDto
  ) {
    return this.scheduleService.updateSchedule(
      userId,
      scheduleId,
      updateDto.dayOfWeek,
      updateDto.order
    );
  }

  @Delete(':id')
  async deleteSchedule(
    @UserId() userId: string,
    @Param('id') scheduleId: string
  ) {
    await this.scheduleService.deleteSchedule(userId, scheduleId);
    return { success: true };
  }
}
