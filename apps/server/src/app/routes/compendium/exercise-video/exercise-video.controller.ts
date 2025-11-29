import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { CompendiumExerciseVideoService } from '../../../core/compendium/exercise-video/compendium-exercise-video.service';
import { UserId } from '../../../common/decorators/user-id.decorator';
import {
  CreateExerciseVideoDto,
  CreateExerciseVideoResponseDto,
} from './dto/exercise-video.dto';

@ApiTags('compendium:exercise-video')
@Controller('compendium/exercise-video')
export class ExerciseVideoController {
  constructor(
    private compendiumExerciseVideoService: CompendiumExerciseVideoService
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all exercise videos', description: 'Retrieve a list of all exercise videos' })
  @ApiResponse({ status: 200, description: 'List of exercise videos retrieved successfully', type: [CreateExerciseVideoResponseDto] })
  async findAll(): Promise<CreateExerciseVideoResponseDto[]> {
    const videos =
      await this.compendiumExerciseVideoService.findAll();
    return videos.map((video) =>
      plainToInstance(CreateExerciseVideoResponseDto, video)
    );
  }

  @Get('exercise/:exerciseTemplateId')
  @ApiOperation({ summary: 'Get videos by exercise ID', description: 'Retrieve all videos for a specific exercise template' })
  @ApiParam({ name: 'exerciseTemplateId', description: 'Exercise template ID' })
  @ApiResponse({ status: 200, description: 'List of exercise videos retrieved successfully', type: [CreateExerciseVideoResponseDto] })
  async findByExerciseId(
    @Param('exerciseTemplateId') exerciseTemplateId: string
  ): Promise<CreateExerciseVideoResponseDto[]> {
    const videos = await this.compendiumExerciseVideoService.findByExerciseId(
      exerciseTemplateId
    );
    return videos.map((video) =>
      plainToInstance(CreateExerciseVideoResponseDto, video)
    );
  }

  @Get(':exerciseTemplateId/:url')
  @ApiOperation({ summary: 'Get exercise video by composite key', description: 'Retrieve a specific exercise video by exercise template ID and URL' })
  @ApiParam({ name: 'exerciseTemplateId', description: 'Exercise template ID' })
  @ApiParam({ name: 'url', description: 'Video URL' })
  @ApiResponse({ status: 200, description: 'Exercise video retrieved successfully', type: CreateExerciseVideoResponseDto })
  @ApiResponse({ status: 404, description: 'Exercise video not found' })
  async findByCompositeKey(
    @Param('exerciseTemplateId') exerciseTemplateId: string,
    @Param('url') url: string
  ): Promise<CreateExerciseVideoResponseDto> {
    const video =
      await this.compendiumExerciseVideoService.findByCompositeKey(
        exerciseTemplateId,
        url
      );
    return plainToInstance(CreateExerciseVideoResponseDto, video);
  }

  @Post()
  @ApiOperation({ summary: 'Create exercise video', description: 'Create a new exercise video' })
  @ApiResponse({ status: 201, description: 'Exercise video created successfully', type: CreateExerciseVideoResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(
    @Body() data: CreateExerciseVideoDto,
    @UserId() userId: string
  ): Promise<CreateExerciseVideoResponseDto> {
    const video = await this.compendiumExerciseVideoService.create(
      data,
      userId
    );
    return plainToInstance(CreateExerciseVideoResponseDto, video);
  }

  @Put(':exerciseTemplateId/:url')
  @ApiOperation({ summary: 'Update exercise video', description: 'Update an existing exercise video' })
  @ApiParam({ name: 'exerciseTemplateId', description: 'Exercise template ID' })
  @ApiParam({ name: 'url', description: 'Video URL' })
  @ApiResponse({ status: 200, description: 'Exercise video updated successfully', type: CreateExerciseVideoResponseDto })
  @ApiResponse({ status: 404, description: 'Exercise video not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async update(
    @Param('exerciseTemplateId') exerciseTemplateId: string,
    @Param('url') url: string,
    @Body() data: CreateExerciseVideoDto,
    @UserId() userId: string
  ): Promise<CreateExerciseVideoResponseDto> {
    const video = await this.compendiumExerciseVideoService.update(
      exerciseTemplateId,
      url,
      data,
      userId
    );
    return plainToInstance(CreateExerciseVideoResponseDto, video);
  }

  @Delete(':exerciseTemplateId/:url')
  @ApiOperation({ summary: 'Delete exercise video', description: 'Delete an exercise video' })
  @ApiParam({ name: 'exerciseTemplateId', description: 'Exercise template ID' })
  @ApiParam({ name: 'url', description: 'Video URL' })
  @ApiResponse({ status: 200, description: 'Exercise video deleted successfully' })
  @ApiResponse({ status: 404, description: 'Exercise video not found' })
  async delete(
    @Param('exerciseTemplateId') exerciseTemplateId: string,
    @Param('url') url: string,
    @UserId() userId: string
  ) {
    return this.compendiumExerciseVideoService.delete(
      exerciseTemplateId,
      url
    );
  }
}
