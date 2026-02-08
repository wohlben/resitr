import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { UserWorkoutLogService } from '../../../core/user/workout-log/user-workout-log.service';
import { UpdateSetDto, SkipSetsDto, UpsertWorkoutLogDto } from './dto/workout-log.dto';
import { UserId } from '../../../common/decorators/user-id.decorator';

@ApiTags('user:workout-log')
@Controller('user/workout-logs')
export class UserWorkoutLogController {
  constructor(private readonly logService: UserWorkoutLogService) {}

  @Get()
  @ApiOperation({
    summary: 'List workout logs',
    description: 'List all workout logs for the current user, optionally filtered by workout template',
  })
  @ApiQuery({ name: 'workoutTemplateId', required: false, description: 'Filter by workout template ID' })
  @ApiResponse({ status: 200, description: 'Workout logs retrieved successfully' })
  async listLogs(@UserId() userId: string, @Query('workoutTemplateId') workoutTemplateId?: string) {
    return this.logService.listLogs(userId, workoutTemplateId);
  }

  @Put()
  @ApiOperation({ summary: 'Upsert workout log', description: 'Create or update a user workout log' })
  @ApiResponse({ status: 200, description: 'Workout log created or updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async upsertLog(@Body() dto: UpsertWorkoutLogDto, @UserId() userId: string) {
    return this.logService.upsertLog(dto, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workout log', description: 'Retrieve a specific workout log by ID' })
  @ApiParam({ name: 'id', description: 'Workout log ID' })
  @ApiResponse({ status: 200, description: 'Workout log retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Workout log not found' })
  async getLog(@Param('id') id: string) {
    return this.logService.getLog(id);
  }

  @Post('sets/:setId/complete')
  @ApiOperation({ summary: 'Complete set', description: 'Mark a set as completed with achieved metrics' })
  @ApiParam({ name: 'setId', description: 'Set ID' })
  @ApiResponse({ status: 200, description: 'Set completed successfully' })
  @ApiResponse({ status: 404, description: 'Set not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async completeSet(@Param('setId') setId: string, @Body() dto: UpdateSetDto) {
    return this.logService.completeSet(setId, dto);
  }

  @Post('sets/skip')
  @ApiOperation({ summary: 'Skip sets', description: 'Mark multiple sets as skipped' })
  @ApiResponse({ status: 200, description: 'Sets skipped successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async skipSets(@Body() dto: SkipSetsDto) {
    return this.logService.skipSets(dto.setIds);
  }
}
