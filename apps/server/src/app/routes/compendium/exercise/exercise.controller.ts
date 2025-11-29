import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CompendiumExerciseService } from '../../../core/compendium/exercise/compendium-exercise.service';
import { UserId } from '../../../common/decorators/user-id.decorator';
import { CreateExerciseTemplateDto, CreateExerciseTemplateResponseDto } from './dto/exercise-template.dto';
import { plainToInstance } from 'class-transformer';

@ApiTags('compendium:exercise')
@Controller('compendium/exercise')
export class ExerciseController {
  constructor(private compendiumExerciseService: CompendiumExerciseService) {}

  @Get()
  @ApiOperation({ summary: 'Get all exercises', description: 'Retrieve a list of all exercise templates' })
  @ApiResponse({ status: 200, description: 'List of exercises retrieved successfully', type: [CreateExerciseTemplateResponseDto] })
  async findAll(): Promise<CreateExerciseTemplateResponseDto[]> {
    const exercises = await this.compendiumExerciseService.findAll();
    return exercises.map((exercise) => plainToInstance(CreateExerciseTemplateResponseDto, exercise));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get exercise by ID', description: 'Retrieve a specific exercise template by its ID' })
  @ApiParam({ name: 'id', description: 'Exercise template ID' })
  @ApiResponse({ status: 200, description: 'Exercise retrieved successfully', type: CreateExerciseTemplateResponseDto })
  @ApiResponse({ status: 404, description: 'Exercise not found' })
  async findById(@Param('id') id: string): Promise<CreateExerciseTemplateResponseDto> {
    const exercise = await this.compendiumExerciseService.findById(id);
    return plainToInstance(CreateExerciseTemplateResponseDto, exercise);
  }

  @Post()
  @ApiOperation({ summary: 'Create exercise', description: 'Create a new exercise template' })
  @ApiResponse({ status: 201, description: 'Exercise created successfully', type: CreateExerciseTemplateResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(
    @Body() data: CreateExerciseTemplateDto,
    @UserId() userId: string
  ): Promise<CreateExerciseTemplateResponseDto> {
    const exercise = await this.compendiumExerciseService.create(data, userId);
    return plainToInstance(CreateExerciseTemplateResponseDto, exercise);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update exercise', description: 'Update an existing exercise template' })
  @ApiParam({ name: 'id', description: 'Exercise template ID' })
  @ApiResponse({ status: 200, description: 'Exercise updated successfully', type: CreateExerciseTemplateResponseDto })
  @ApiResponse({ status: 404, description: 'Exercise not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async update(
    @Param('id') id: string,
    @Body() data: CreateExerciseTemplateDto,
    @UserId() userId: string
  ): Promise<CreateExerciseTemplateResponseDto> {
    const exercise = await this.compendiumExerciseService.update(id, data, userId);
    return plainToInstance(CreateExerciseTemplateResponseDto, exercise);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete exercise', description: 'Delete an exercise template' })
  @ApiParam({ name: 'id', description: 'Exercise template ID' })
  @ApiResponse({ status: 200, description: 'Exercise deleted successfully' })
  @ApiResponse({ status: 404, description: 'Exercise not found' })
  async delete(@Param('id') id: string, @UserId() userId: string) {
    return this.compendiumExerciseService.delete(id);
  }
}
