import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UserWorkoutService } from '../../../core/user/workout/user-workout.service';
import { UserId } from '../../../common/decorators/user-id.decorator';
import { CreateUserWorkoutDto } from './dto/user-workout.dto';

@ApiTags('user:workout')
@Controller('user/workout')
export class UserWorkoutController {
  constructor(private readonly workoutService: UserWorkoutService) {}

  @Post()
  @ApiOperation({ summary: 'Create user workout', description: 'Add a workout to user\'s workouts' })
  @ApiResponse({ status: 201, description: 'User workout created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Workout already added' })
  async createUserWorkout(
    @UserId() userId: string,
    @Body() createDto: CreateUserWorkoutDto
  ) {
    return this.workoutService.createUserWorkout(userId, createDto.workoutTemplateId);
  }

  @Get()
  @ApiOperation({ summary: 'Get user workouts', description: 'Retrieve all workouts for the user' })
  @ApiResponse({ status: 200, description: 'List of user workouts retrieved successfully' })
  async getUserWorkouts(@UserId() userId: string) {
    return this.workoutService.getUserWorkouts(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user workout by ID', description: 'Retrieve a specific user workout by its ID' })
  @ApiParam({ name: 'id', description: 'User workout ID' })
  @ApiResponse({ status: 200, description: 'User workout retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User workout not found' })
  async getUserWorkoutById(
    @UserId() userId: string,
    @Param('id') userWorkoutId: string
  ) {
    return this.workoutService.getUserWorkoutById(userId, userWorkoutId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user workout', description: 'Remove a workout from user\'s workouts' })
  @ApiParam({ name: 'id', description: 'User workout ID' })
  @ApiResponse({ status: 200, description: 'User workout deleted successfully' })
  @ApiResponse({ status: 404, description: 'User workout not found' })
  async deleteUserWorkout(
    @UserId() userId: string,
    @Param('id') userWorkoutId: string
  ) {
    await this.workoutService.deleteUserWorkout(userId, userWorkoutId);
    return { success: true };
  }
}
