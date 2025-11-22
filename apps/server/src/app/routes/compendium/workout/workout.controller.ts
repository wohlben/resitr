import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CompendiumWorkoutService } from '../../../core/compendium/workout/compendium-workout.service';
import { UserId } from '../../../common/decorators/user-id.decorator';
import { CreateWorkoutDto, CreateWorkoutResponseDto } from './dto/workout.dto';

@Controller('workout')
export class WorkoutController {
  constructor(private compendiumWorkoutService: CompendiumWorkoutService) {}

  @Get()
  async findAll(): Promise<CreateWorkoutResponseDto[]> {
    const workouts = await this.compendiumWorkoutService.findAll();
    return workouts.map((workout) => plainToInstance(CreateWorkoutResponseDto, workout));
  }

  @Get(':templateId')
  async findById(@Param('templateId') templateId: string): Promise<CreateWorkoutResponseDto> {
    const workout = await this.compendiumWorkoutService.findById(templateId);
    return plainToInstance(CreateWorkoutResponseDto, workout);
  }

  @Post()
  async create(
    @Body() data: CreateWorkoutDto,
    @UserId() userId: string
  ): Promise<CreateWorkoutResponseDto> {
    const workout = await this.compendiumWorkoutService.create(data, userId);
    return plainToInstance(CreateWorkoutResponseDto, workout);
  }

  @Put(':templateId')
  async update(
    @Param('templateId') templateId: string,
    @Body() data: CreateWorkoutDto,
    @UserId() userId: string
  ): Promise<CreateWorkoutResponseDto> {
    const workout = await this.compendiumWorkoutService.update(templateId, data, userId);
    return plainToInstance(CreateWorkoutResponseDto, workout);
  }

  @Delete(':templateId')
  async delete(@Param('templateId') templateId: string, @UserId() userId: string) {
    return this.compendiumWorkoutService.delete(templateId);
  }
}
