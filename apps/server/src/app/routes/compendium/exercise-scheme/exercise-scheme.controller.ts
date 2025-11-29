import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { CompendiumExerciseSchemeService } from '../../../core/compendium/exercise-scheme/compendium-exercise-scheme.service';
import { UserId } from '../../../common/decorators/user-id.decorator';
import {
  CreateExerciseSchemeDto,
  CreateExerciseSchemeResponseDto,
} from './dto/exercise-scheme.dto';

@ApiTags('compendium:exercise-scheme')
@Controller('compendium/exercise-scheme')
export class ExerciseSchemeController {
  constructor(private compendiumExerciseSchemeService: CompendiumExerciseSchemeService) {}

  @Get()
  @ApiOperation({ summary: 'Get all exercise schemes', description: 'Retrieve a list of all exercise scheme templates' })
  @ApiResponse({ status: 200, description: 'List of exercise schemes retrieved successfully', type: [CreateExerciseSchemeResponseDto] })
  async findAll(): Promise<CreateExerciseSchemeResponseDto[]> {
    const schemes = await this.compendiumExerciseSchemeService.findAll();
    return schemes.map((scheme) => plainToInstance(CreateExerciseSchemeResponseDto, scheme));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get exercise scheme by ID', description: 'Retrieve a specific exercise scheme template by its ID' })
  @ApiParam({ name: 'id', description: 'Exercise scheme ID' })
  @ApiResponse({ status: 200, description: 'Exercise scheme retrieved successfully', type: CreateExerciseSchemeResponseDto })
  @ApiResponse({ status: 404, description: 'Exercise scheme not found' })
  async findById(@Param('id') id: string): Promise<CreateExerciseSchemeResponseDto> {
    const scheme = await this.compendiumExerciseSchemeService.findById(id);
    return plainToInstance(CreateExerciseSchemeResponseDto, scheme);
  }

  @Get('exercise/:exerciseId')
  @ApiOperation({ summary: 'Get exercise schemes by exercise', description: 'Retrieve all scheme templates for a specific exercise' })
  @ApiParam({ name: 'exerciseId', description: 'Exercise template ID' })
  @ApiResponse({ status: 200, description: 'Exercise schemes retrieved successfully', type: [CreateExerciseSchemeResponseDto] })
  async findByExerciseId(@Param('exerciseId') exerciseId: string): Promise<CreateExerciseSchemeResponseDto[]> {
    const schemes = await this.compendiumExerciseSchemeService.findByExerciseId(exerciseId);
    return schemes.map((scheme) => plainToInstance(CreateExerciseSchemeResponseDto, scheme));
  }

  @Post()
  @ApiOperation({ summary: 'Create exercise scheme', description: 'Create a new exercise scheme template' })
  @ApiResponse({ status: 201, description: 'Exercise scheme created successfully', type: CreateExerciseSchemeResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(
    @Body() data: CreateExerciseSchemeDto,
    @UserId() userId: string
  ): Promise<CreateExerciseSchemeResponseDto> {
    const scheme = await this.compendiumExerciseSchemeService.create(data, userId);
    return plainToInstance(CreateExerciseSchemeResponseDto, scheme);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update exercise scheme', description: 'Update an existing exercise scheme template' })
  @ApiParam({ name: 'id', description: 'Exercise scheme ID' })
  @ApiResponse({ status: 200, description: 'Exercise scheme updated successfully', type: CreateExerciseSchemeResponseDto })
  @ApiResponse({ status: 404, description: 'Exercise scheme not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async update(
    @Param('id') id: string,
    @Body() data: CreateExerciseSchemeDto,
    @UserId() userId: string
  ): Promise<CreateExerciseSchemeResponseDto> {
    const scheme = await this.compendiumExerciseSchemeService.update(id, data, userId);
    return plainToInstance(CreateExerciseSchemeResponseDto, scheme);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete exercise scheme', description: 'Delete an exercise scheme template' })
  @ApiParam({ name: 'id', description: 'Exercise scheme ID' })
  @ApiResponse({ status: 200, description: 'Exercise scheme deleted successfully' })
  @ApiResponse({ status: 404, description: 'Exercise scheme not found' })
  async delete(@Param('id') id: string, @UserId() userId: string) {
    return this.compendiumExerciseSchemeService.delete(id);
  }
}
