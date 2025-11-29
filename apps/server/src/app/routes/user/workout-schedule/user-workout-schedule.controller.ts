import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { UserWorkoutScheduleService } from '../../../core/user/workout-schedule/user-workout-schedule.service';
import { UserId } from '../../../common/decorators/user-id.decorator';
import {
  CreateUserWorkoutScheduleDto,
  UpdateUserWorkoutScheduleDto,
} from './dto/user-workout-schedule.dto';

@ApiTags('user:workout-schedule')
@Controller('user/workout-schedule')
export class UserWorkoutScheduleController {
  constructor(
    private readonly scheduleService: UserWorkoutScheduleService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create workout schedule', description: 'Schedule a workout for a specific day of the week' })
  @ApiResponse({ status: 201, description: 'Workout schedule created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
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
  @ApiOperation({ summary: 'Get user workout schedules', description: 'Retrieve workout schedules for the user, optionally filtered by day' })
  @ApiQuery({ name: 'dayOfWeek', description: 'Day of week (0-6, Sunday-Saturday)', required: false })
  @ApiResponse({ status: 200, description: 'List of workout schedules retrieved successfully' })
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
  @ApiOperation({ summary: 'Get workout schedule by ID', description: 'Retrieve a specific workout schedule by its ID' })
  @ApiParam({ name: 'id', description: 'Workout schedule ID' })
  @ApiResponse({ status: 200, description: 'Workout schedule retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Workout schedule not found' })
  async getScheduleById(
    @UserId() userId: string,
    @Param('id') scheduleId: string
  ) {
    return this.scheduleService.getScheduleById(userId, scheduleId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update workout schedule', description: 'Update an existing workout schedule' })
  @ApiParam({ name: 'id', description: 'Workout schedule ID' })
  @ApiResponse({ status: 200, description: 'Workout schedule updated successfully' })
  @ApiResponse({ status: 404, description: 'Workout schedule not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
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
  @ApiOperation({ summary: 'Delete workout schedule', description: 'Delete a workout schedule' })
  @ApiParam({ name: 'id', description: 'Workout schedule ID' })
  @ApiResponse({ status: 200, description: 'Workout schedule deleted successfully' })
  @ApiResponse({ status: 404, description: 'Workout schedule not found' })
  async deleteSchedule(
    @UserId() userId: string,
    @Param('id') scheduleId: string
  ) {
    await this.scheduleService.deleteSchedule(userId, scheduleId);
    return { success: true };
  }
}
