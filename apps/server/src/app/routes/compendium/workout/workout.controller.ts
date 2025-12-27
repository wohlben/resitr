import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { CompendiumWorkoutService } from '../../../core/compendium/workout/compendium-workout.service';
import { UserId } from '../../../common/decorators/user-id.decorator';
import { CreateWorkoutDto, CreateWorkoutResponseDto } from './dto/workout.dto';

@ApiTags('compendium:workout')
@Controller('compendium/workout')
export class WorkoutController {
  constructor(private compendiumWorkoutService: CompendiumWorkoutService) {}

  @Get()
  @ApiOperation({ summary: 'Get all workouts', description: 'Retrieve a list of all workout templates' })
  @ApiResponse({ status: 200, description: 'List of workouts retrieved successfully', type: [CreateWorkoutResponseDto] })
  async findAll(): Promise<CreateWorkoutResponseDto[]> {
    const workouts = await this.compendiumWorkoutService.findAll();
    return workouts.map((workout) => plainToInstance(CreateWorkoutResponseDto, workout));
  }

  @Get('lineage/:lineageId/versions')
  @ApiOperation({ summary: 'Get version history', description: 'Get all versions of a workout lineage' })
  @ApiParam({ name: 'lineageId', description: 'Workout lineage ID' })
  @ApiResponse({ status: 200, description: 'Version history retrieved successfully', type: [CreateWorkoutResponseDto] })
  async findVersionHistory(@Param('lineageId') lineageId: string): Promise<CreateWorkoutResponseDto[]> {
    const workouts = await this.compendiumWorkoutService.findVersionHistory(lineageId);
    return workouts.map((workout) => plainToInstance(CreateWorkoutResponseDto, workout));
  }

  @Get(':templateId')
  @ApiOperation({ summary: 'Get workout by ID', description: 'Retrieve a specific workout template by its ID' })
  @ApiParam({ name: 'templateId', description: 'Workout template ID' })
  @ApiResponse({ status: 200, description: 'Workout retrieved successfully', type: CreateWorkoutResponseDto })
  @ApiResponse({ status: 404, description: 'Workout not found' })
  async findById(@Param('templateId') templateId: string): Promise<CreateWorkoutResponseDto> {
    const workout = await this.compendiumWorkoutService.findById(templateId);
    return plainToInstance(CreateWorkoutResponseDto, workout);
  }

  @Post()
  @ApiOperation({ summary: 'Create workout', description: 'Create a new workout template' })
  @ApiResponse({ status: 201, description: 'Workout created successfully', type: CreateWorkoutResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(
    @Body() data: CreateWorkoutDto,
    @UserId() userId: string
  ): Promise<CreateWorkoutResponseDto> {
    const workout = await this.compendiumWorkoutService.create(data, userId);
    return plainToInstance(CreateWorkoutResponseDto, workout);
  }

  @Put(':templateId')
  @ApiOperation({ summary: 'Update workout', description: 'Update an existing workout template' })
  @ApiParam({ name: 'templateId', description: 'Workout template ID' })
  @ApiResponse({ status: 200, description: 'Workout updated successfully', type: CreateWorkoutResponseDto })
  @ApiResponse({ status: 404, description: 'Workout not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async update(
    @Param('templateId') templateId: string,
    @Body() data: CreateWorkoutDto,
    @UserId() userId: string
  ): Promise<CreateWorkoutResponseDto> {
    const workout = await this.compendiumWorkoutService.update(templateId, data, userId);
    return plainToInstance(CreateWorkoutResponseDto, workout);
  }

  @Delete(':templateId')
  @ApiOperation({ summary: 'Delete workout', description: 'Delete a workout template' })
  @ApiParam({ name: 'templateId', description: 'Workout template ID' })
  @ApiResponse({ status: 200, description: 'Workout deleted successfully' })
  @ApiResponse({ status: 404, description: 'Workout not found' })
  async delete(@Param('templateId') templateId: string, @UserId() userId: string) {
    return this.compendiumWorkoutService.delete(templateId);
  }
}
