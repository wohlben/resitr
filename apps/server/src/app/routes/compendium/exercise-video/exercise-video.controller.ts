import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CompendiumExerciseVideoService } from '../../../core/compendium/exercise-video/compendium-exercise-video.service';
import { UserId } from '../../../common/decorators/user-id.decorator';
import {
  CreateExerciseVideoDto,
  CreateExerciseVideoResponseDto,
} from './dto/exercise-video.dto';

@Controller('exercise-video')
export class ExerciseVideoController {
  constructor(
    private compendiumExerciseVideoService: CompendiumExerciseVideoService
  ) {}

  @Get()
  async findAll(): Promise<CreateExerciseVideoResponseDto[]> {
    const videos =
      await this.compendiumExerciseVideoService.findAll();
    return videos.map((video) =>
      plainToInstance(CreateExerciseVideoResponseDto, video)
    );
  }

  @Get('exercise/:exerciseTemplateId')
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
