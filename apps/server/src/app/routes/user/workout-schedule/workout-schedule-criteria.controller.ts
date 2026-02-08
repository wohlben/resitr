import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { WorkoutScheduleService } from '../../../core/user/workout-schedule/workout-schedule.service';
import { WorkoutScheduleCriteriaService } from '../../../core/user/workout-schedule/workout-schedule-criteria.service';
import { UserId } from '../../../common/decorators/user-id.decorator';
import {
  CreateWorkoutScheduleCriteriaDto,
  UpdateWorkoutScheduleCriteriaDto,
  WorkoutScheduleCriteriaResponseDto,
} from './dto/workout-schedule.dto';

@ApiTags('user:workout-schedule-criteria')
@Controller('user/workout-schedule/:scheduleId/criteria')
export class WorkoutScheduleCriteriaController {
  constructor(
    private readonly scheduleService: WorkoutScheduleService,
    private readonly criteriaService: WorkoutScheduleCriteriaService
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create schedule criteria',
    description: 'Add a criteria (e.g., day of week) to a workout schedule',
  })
  @ApiParam({ name: 'scheduleId', description: 'Workout schedule ID' })
  @ApiResponse({ status: 201, description: 'Criteria created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  async createCriteria(
    @UserId() userId: string,
    @Param('scheduleId') scheduleId: string,
    @Body() createDto: CreateWorkoutScheduleCriteriaDto
  ): Promise<WorkoutScheduleCriteriaResponseDto> {
    // Verify schedule exists and belongs to user
    await this.scheduleService.getScheduleById(userId, scheduleId);

    const criteriaWithDays = await this.criteriaService.createCriteria(scheduleId, createDto.type, createDto.days);

    return this.mapToResponseDto(criteriaWithDays);
  }

  @Get()
  @ApiOperation({
    summary: 'Get schedule criteria',
    description: 'Get all criteria for a workout schedule',
  })
  @ApiParam({ name: 'scheduleId', description: 'Workout schedule ID' })
  @ApiResponse({ status: 200, description: 'Criteria retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  async getCriteriaBySchedule(
    @UserId() userId: string,
    @Param('scheduleId') scheduleId: string
  ): Promise<WorkoutScheduleCriteriaResponseDto[]> {
    // Verify schedule exists and belongs to user
    await this.scheduleService.getScheduleById(userId, scheduleId);

    const criteriaList = await this.criteriaService.getCriteriaByScheduleId(scheduleId);
    return criteriaList.map((c) => this.mapToResponseDto(c));
  }

  @Get(':criteriaId')
  @ApiOperation({
    summary: 'Get criteria by ID',
    description: 'Get a specific criteria by its ID',
  })
  @ApiParam({ name: 'scheduleId', description: 'Workout schedule ID' })
  @ApiParam({ name: 'criteriaId', description: 'Criteria ID' })
  @ApiResponse({ status: 200, description: 'Criteria retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Criteria not found' })
  async getCriteriaById(
    @UserId() userId: string,
    @Param('scheduleId') scheduleId: string,
    @Param('criteriaId') criteriaId: string
  ): Promise<WorkoutScheduleCriteriaResponseDto> {
    // Verify schedule exists and belongs to user
    await this.scheduleService.getScheduleById(userId, scheduleId);

    const criteriaWithDays = await this.criteriaService.getCriteriaById(scheduleId, criteriaId);
    return this.mapToResponseDto(criteriaWithDays);
  }

  @Put(':criteriaId')
  @ApiOperation({
    summary: 'Update criteria',
    description: 'Update a criteria (full replacement)',
  })
  @ApiParam({ name: 'scheduleId', description: 'Workout schedule ID' })
  @ApiParam({ name: 'criteriaId', description: 'Criteria ID' })
  @ApiResponse({ status: 200, description: 'Criteria updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Criteria not found' })
  async updateCriteria(
    @UserId() userId: string,
    @Param('scheduleId') scheduleId: string,
    @Param('criteriaId') criteriaId: string,
    @Body() updateDto: UpdateWorkoutScheduleCriteriaDto
  ): Promise<WorkoutScheduleCriteriaResponseDto> {
    // Verify schedule exists and belongs to user
    await this.scheduleService.getScheduleById(userId, scheduleId);

    const criteriaWithDays = await this.criteriaService.updateCriteria(
      scheduleId,
      criteriaId,
      updateDto.type,
      updateDto.days,
      updateDto.order
    );

    return this.mapToResponseDto(criteriaWithDays);
  }

  @Delete(':criteriaId')
  @ApiOperation({
    summary: 'Delete criteria',
    description: 'Delete a criteria from a schedule',
  })
  @ApiParam({ name: 'scheduleId', description: 'Workout schedule ID' })
  @ApiParam({ name: 'criteriaId', description: 'Criteria ID' })
  @ApiResponse({ status: 200, description: 'Criteria deleted successfully' })
  @ApiResponse({ status: 404, description: 'Criteria not found' })
  async deleteCriteria(
    @UserId() userId: string,
    @Param('scheduleId') scheduleId: string,
    @Param('criteriaId') criteriaId: string
  ): Promise<{ success: boolean }> {
    // Verify schedule exists and belongs to user
    await this.scheduleService.getScheduleById(userId, scheduleId);

    await this.criteriaService.deleteCriteria(scheduleId, criteriaId);
    return { success: true };
  }

  private mapToResponseDto(criteriaWithDays: {
    criteria: { id: string; scheduleId: string; type: 'DAY_OF_WEEK'; order: number };
    daysOfWeek: number[];
  }): WorkoutScheduleCriteriaResponseDto {
    return {
      id: criteriaWithDays.criteria.id,
      scheduleId: criteriaWithDays.criteria.scheduleId,
      type: criteriaWithDays.criteria.type,
      order: criteriaWithDays.criteria.order,
      days: criteriaWithDays.daysOfWeek,
    };
  }
}
