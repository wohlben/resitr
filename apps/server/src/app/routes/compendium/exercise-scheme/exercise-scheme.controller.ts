import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CompendiumExerciseSchemeService } from '../../../core/compendium/exercise-scheme/compendium-exercise-scheme.service';
import { UserId } from '../../../common/decorators/user-id.decorator';
import {
  CreateExerciseSchemeDto,
  CreateExerciseSchemeResponseDto,
} from './dto/exercise-scheme.dto';

@Controller('compendium/exercise-scheme')
export class ExerciseSchemeController {
  constructor(private compendiumExerciseSchemeService: CompendiumExerciseSchemeService) {}

  @Get()
  async findAll(): Promise<CreateExerciseSchemeResponseDto[]> {
    const schemes = await this.compendiumExerciseSchemeService.findAll();
    return schemes.map((scheme) => plainToInstance(CreateExerciseSchemeResponseDto, scheme));
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<CreateExerciseSchemeResponseDto> {
    const scheme = await this.compendiumExerciseSchemeService.findById(id);
    return plainToInstance(CreateExerciseSchemeResponseDto, scheme);
  }

  @Get('exercise/:exerciseId')
  async findByExerciseId(@Param('exerciseId') exerciseId: string): Promise<CreateExerciseSchemeResponseDto[]> {
    const schemes = await this.compendiumExerciseSchemeService.findByExerciseId(exerciseId);
    return schemes.map((scheme) => plainToInstance(CreateExerciseSchemeResponseDto, scheme));
  }

  @Post()
  async create(
    @Body() data: CreateExerciseSchemeDto,
    @UserId() userId: string
  ): Promise<CreateExerciseSchemeResponseDto> {
    const scheme = await this.compendiumExerciseSchemeService.create(data, userId);
    return plainToInstance(CreateExerciseSchemeResponseDto, scheme);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: CreateExerciseSchemeDto,
    @UserId() userId: string
  ): Promise<CreateExerciseSchemeResponseDto> {
    const scheme = await this.compendiumExerciseSchemeService.update(id, data, userId);
    return plainToInstance(CreateExerciseSchemeResponseDto, scheme);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @UserId() userId: string) {
    return this.compendiumExerciseSchemeService.delete(id);
  }
}
