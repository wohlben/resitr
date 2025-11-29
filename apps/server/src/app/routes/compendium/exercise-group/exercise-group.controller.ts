import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CompendiumExerciseGroupService } from '../../../core/compendium/exercise-group/compendium-exercise-group.service';
import { UserId } from '../../../common/decorators/user-id.decorator';
import { CreateExerciseGroupDto, CreateExerciseGroupResponseDto } from './dto/exercise-group.dto';
import { plainToInstance } from 'class-transformer';

@ApiTags('compendium:exercise-group')
@Controller('compendium/exercise-group')
export class ExerciseGroupController {
  constructor(private compendiumExerciseGroupService: CompendiumExerciseGroupService) {}

  @Get()
  @ApiOperation({ summary: 'Get all exercise groups', description: 'Retrieve a list of all exercise groups' })
  @ApiResponse({ status: 200, description: 'List of exercise groups retrieved successfully', type: [CreateExerciseGroupResponseDto] })
  async findAll(): Promise<CreateExerciseGroupResponseDto[]> {
    const groups = await this.compendiumExerciseGroupService.findAll();
    return groups.map((group) => plainToInstance(CreateExerciseGroupResponseDto, group));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get exercise group by ID', description: 'Retrieve a specific exercise group by its ID' })
  @ApiParam({ name: 'id', description: 'Exercise group ID' })
  @ApiResponse({ status: 200, description: 'Exercise group retrieved successfully', type: CreateExerciseGroupResponseDto })
  @ApiResponse({ status: 404, description: 'Exercise group not found' })
  async findById(@Param('id') id: string): Promise<CreateExerciseGroupResponseDto> {
    const group = await this.compendiumExerciseGroupService.findById(id);
    return plainToInstance(CreateExerciseGroupResponseDto, group);
  }

  @Get('by-name/:name')
  @ApiOperation({ summary: 'Get exercise group by name', description: 'Retrieve a specific exercise group by its name' })
  @ApiParam({ name: 'name', description: 'Exercise group name' })
  @ApiResponse({ status: 200, description: 'Exercise group retrieved successfully', type: CreateExerciseGroupResponseDto })
  @ApiResponse({ status: 404, description: 'Exercise group not found' })
  async findByName(@Param('name') name: string): Promise<CreateExerciseGroupResponseDto> {
    const group = await this.compendiumExerciseGroupService.findByName(name);
    return plainToInstance(CreateExerciseGroupResponseDto, group);
  }

  @Post()
  @ApiOperation({ summary: 'Create exercise group', description: 'Create a new exercise group' })
  @ApiResponse({ status: 201, description: 'Exercise group created successfully', type: CreateExerciseGroupResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(
    @Body() data: CreateExerciseGroupDto,
    @UserId() userId: string
  ): Promise<CreateExerciseGroupResponseDto> {
    const group = await this.compendiumExerciseGroupService.create(data, userId);
    return plainToInstance(CreateExerciseGroupResponseDto, group);
  }

  @Post('upsert')
  @ApiOperation({ summary: 'Upsert exercise group', description: 'Create or update an exercise group' })
  @ApiResponse({ status: 201, description: 'Exercise group created or updated successfully', type: CreateExerciseGroupResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async upsert(
    @Body() data: CreateExerciseGroupDto,
    @UserId() userId: string
  ): Promise<CreateExerciseGroupResponseDto> {
    const group = await this.compendiumExerciseGroupService.upsert(data, userId);
    return plainToInstance(CreateExerciseGroupResponseDto, group);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update exercise group', description: 'Update an existing exercise group' })
  @ApiParam({ name: 'id', description: 'Exercise group ID' })
  @ApiResponse({ status: 200, description: 'Exercise group updated successfully', type: CreateExerciseGroupResponseDto })
  @ApiResponse({ status: 404, description: 'Exercise group not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async update(
    @Param('id') id: string,
    @Body() data: CreateExerciseGroupDto
  ): Promise<CreateExerciseGroupResponseDto> {
    const group = await this.compendiumExerciseGroupService.update(id, data);
    return plainToInstance(CreateExerciseGroupResponseDto, group);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete exercise group', description: 'Delete an exercise group' })
  @ApiParam({ name: 'id', description: 'Exercise group ID' })
  @ApiResponse({ status: 200, description: 'Exercise group deleted successfully' })
  @ApiResponse({ status: 404, description: 'Exercise group not found' })
  async delete(@Param('id') id: string) {
    return this.compendiumExerciseGroupService.delete(id);
  }
}
