import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CompendiumExerciseService } from '../../../core/compendium/exercise/compendium-exercise.service';
import { UserId } from '../../../common/decorators/user-id.decorator';
import { CreateExerciseTemplateDto, CreateExerciseTemplateResponseDto } from './dto/exercise-template.dto';
import { plainToInstance } from 'class-transformer';

@Controller('compendium/exercise')
export class ExerciseController {
  constructor(private compendiumExerciseService: CompendiumExerciseService) {}

  @Get()
  async findAll(): Promise<CreateExerciseTemplateResponseDto[]> {
    const exercises = await this.compendiumExerciseService.findAll();
    return exercises.map((exercise) => plainToInstance(CreateExerciseTemplateResponseDto, exercise));
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<CreateExerciseTemplateResponseDto> {
    const exercise = await this.compendiumExerciseService.findById(id);
    return plainToInstance(CreateExerciseTemplateResponseDto, exercise);
  }

  @Post()
  async create(
    @Body() data: CreateExerciseTemplateDto,
    @UserId() userId: string
  ): Promise<CreateExerciseTemplateResponseDto> {
    const exercise = await this.compendiumExerciseService.create(data, userId);
    return plainToInstance(CreateExerciseTemplateResponseDto, exercise);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: CreateExerciseTemplateDto,
    @UserId() userId: string
  ): Promise<CreateExerciseTemplateResponseDto> {
    const exercise = await this.compendiumExerciseService.update(id, data, userId);
    return plainToInstance(CreateExerciseTemplateResponseDto, exercise);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @UserId() userId: string) {
    return this.compendiumExerciseService.delete(id);
  }
}
