import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CompendiumExerciseGroupService } from '../../../core/compendium/exercise-group/compendium-exercise-group.service';
import { UserId } from '../../../common/decorators/user-id.decorator';
import { CreateExerciseGroupDto, CreateExerciseGroupResponseDto } from './dto/exercise-group.dto';
import { plainToInstance } from 'class-transformer';

@Controller('exercise-group')
export class ExerciseGroupController {
  constructor(private compendiumExerciseGroupService: CompendiumExerciseGroupService) {}

  @Get()
  async findAll(): Promise<CreateExerciseGroupResponseDto[]> {
    const groups = await this.compendiumExerciseGroupService.findAll();
    return groups.map((group) => plainToInstance(CreateExerciseGroupResponseDto, group));
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<CreateExerciseGroupResponseDto> {
    const group = await this.compendiumExerciseGroupService.findById(id);
    return plainToInstance(CreateExerciseGroupResponseDto, group);
  }

  @Get('by-name/:name')
  async findByName(@Param('name') name: string): Promise<CreateExerciseGroupResponseDto> {
    const group = await this.compendiumExerciseGroupService.findByName(name);
    return plainToInstance(CreateExerciseGroupResponseDto, group);
  }

  @Post()
  async create(
    @Body() data: CreateExerciseGroupDto,
    @UserId() userId: string
  ): Promise<CreateExerciseGroupResponseDto> {
    const group = await this.compendiumExerciseGroupService.create(data, userId);
    return plainToInstance(CreateExerciseGroupResponseDto, group);
  }

  @Post('upsert')
  async upsert(
    @Body() data: CreateExerciseGroupDto,
    @UserId() userId: string
  ): Promise<CreateExerciseGroupResponseDto> {
    const group = await this.compendiumExerciseGroupService.upsert(data, userId);
    return plainToInstance(CreateExerciseGroupResponseDto, group);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: CreateExerciseGroupDto
  ): Promise<CreateExerciseGroupResponseDto> {
    const group = await this.compendiumExerciseGroupService.update(id, data);
    return plainToInstance(CreateExerciseGroupResponseDto, group);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.compendiumExerciseGroupService.delete(id);
  }
}
