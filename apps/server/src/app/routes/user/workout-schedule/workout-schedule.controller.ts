import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { WorkoutScheduleService } from '../../../core/user/workout-schedule/workout-schedule.service';
import { UserId } from '../../../common/decorators/user-id.decorator';
import { CreateWorkoutScheduleDto, WorkoutScheduleResponseDto } from './dto/workout-schedule.dto';

@ApiTags('user:workout-schedule')
@Controller('user/workout-schedule')
export class WorkoutScheduleController {
  constructor(private readonly scheduleService: WorkoutScheduleService) {}

  @Post()
  @ApiOperation({
    summary: 'Create workout schedule',
    description: 'Create a workout schedule (criteria added separately)',
  })
  @ApiResponse({ status: 201, description: 'Workout schedule created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Workout already scheduled' })
  async createSchedule(
    @UserId() userId: string,
    @Body() createDto: CreateWorkoutScheduleDto
  ): Promise<WorkoutScheduleResponseDto> {
    const schedule = await this.scheduleService.createSchedule(userId, createDto.userWorkoutId);

    return this.mapToResponseDto({
      schedule,
      criteria: [],
    });
  }

  @Get()
  @ApiOperation({
    summary: 'Get user workout schedules',
    description: 'Retrieve workout schedules for the user, optionally filtered by day',
  })
  @ApiQuery({ name: 'dayOfWeek', description: 'Day of week (0-6, Sunday-Saturday)', required: false })
  @ApiResponse({ status: 200, description: 'List of workout schedules retrieved successfully' })
  async getUserSchedules(
    @UserId() userId: string,
    @Query('dayOfWeek') dayOfWeek?: string
  ): Promise<WorkoutScheduleResponseDto[]> {
    let schedulesWithCriteria;

    if (dayOfWeek !== undefined) {
      const day = parseInt(dayOfWeek, 10);
      if (isNaN(day) || day < 0 || day > 6) {
        throw new Error('Invalid dayOfWeek parameter. Must be between 0 and 6.');
      }
      schedulesWithCriteria = await this.scheduleService.getUserSchedulesByDay(userId, day);
    } else {
      schedulesWithCriteria = await this.scheduleService.getUserSchedules(userId);
    }

    return schedulesWithCriteria.map((s) => this.mapToResponseDto(s));
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get workout schedule by ID',
    description: 'Retrieve a specific workout schedule by its ID with all criteria',
  })
  @ApiParam({ name: 'id', description: 'Workout schedule ID' })
  @ApiResponse({ status: 200, description: 'Workout schedule retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Workout schedule not found' })
  async getScheduleById(
    @UserId() userId: string,
    @Param('id') scheduleId: string
  ): Promise<WorkoutScheduleResponseDto> {
    const scheduleWithCriteria = await this.scheduleService.getScheduleById(userId, scheduleId);
    return this.mapToResponseDto(scheduleWithCriteria);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete workout schedule', description: 'Delete a workout schedule and all its criteria' })
  @ApiParam({ name: 'id', description: 'Workout schedule ID' })
  @ApiResponse({ status: 200, description: 'Workout schedule deleted successfully' })
  @ApiResponse({ status: 404, description: 'Workout schedule not found' })
  async deleteSchedule(@UserId() userId: string, @Param('id') scheduleId: string): Promise<{ success: boolean }> {
    await this.scheduleService.deleteSchedule(userId, scheduleId);
    return { success: true };
  }

  private mapToResponseDto(scheduleWithCriteria: {
    schedule: { id: string; userId: string; userWorkoutId: string; createdAt: Date; updatedAt?: Date | null };
    criteria: Array<{
      criteria: { id: string; scheduleId: string; type: 'DAY_OF_WEEK'; order: number };
      daysOfWeek: number[];
    }>;
  }): WorkoutScheduleResponseDto {
    return {
      id: scheduleWithCriteria.schedule.id,
      userId: scheduleWithCriteria.schedule.userId,
      userWorkoutId: scheduleWithCriteria.schedule.userWorkoutId,
      criteria: scheduleWithCriteria.criteria.map((c) => ({
        id: c.criteria.id,
        scheduleId: c.criteria.scheduleId,
        type: c.criteria.type,
        order: c.criteria.order,
        days: c.daysOfWeek,
      })),
      createdAt: scheduleWithCriteria.schedule.createdAt.toISOString(),
      updatedAt: scheduleWithCriteria.schedule.updatedAt?.toISOString(),
    };
  }
}
