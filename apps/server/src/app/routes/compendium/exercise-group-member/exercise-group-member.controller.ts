import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CompendiumExerciseGroupMemberService } from '../../../core/compendium/exercise-group-member/compendium-exercise-group-member.service';
import { UserId } from '../../../common/decorators/user-id.decorator';
import { CreateExerciseGroupMemberDto, CreateExerciseGroupMemberResponseDto } from './dto/exercise-group-member.dto';
import { plainToInstance } from 'class-transformer';

@ApiTags('compendium:exercise-group-member')
@Controller('compendium/exercise-group-member')
export class ExerciseGroupMemberController {
  constructor(private compendiumExerciseGroupMemberService: CompendiumExerciseGroupMemberService) {}

  @Get()
  @ApiOperation({ summary: 'Get all exercise group members', description: 'Retrieve a list of all exercise group memberships' })
  @ApiResponse({ status: 200, description: 'List of exercise group members retrieved successfully', type: [CreateExerciseGroupMemberResponseDto] })
  async findAll(): Promise<CreateExerciseGroupMemberResponseDto[]> {
    const members = await this.compendiumExerciseGroupMemberService.findAll();
    return members.map((member) => plainToInstance(CreateExerciseGroupMemberResponseDto, member));
  }

  @Get('exercise/:exerciseId')
  @ApiOperation({ summary: 'Get group memberships by exercise', description: 'Retrieve all groups that an exercise belongs to' })
  @ApiParam({ name: 'exerciseId', description: 'Exercise template ID' })
  @ApiResponse({ status: 200, description: 'List of exercise group members retrieved successfully', type: [CreateExerciseGroupMemberResponseDto] })
  async findByExerciseId(
    @Param('exerciseId') exerciseId: string
  ): Promise<CreateExerciseGroupMemberResponseDto[]> {
    const members = await this.compendiumExerciseGroupMemberService.findByExerciseId(exerciseId);
    return members.map((member) => plainToInstance(CreateExerciseGroupMemberResponseDto, member));
  }

  @Get('group/:groupId')
  @ApiOperation({ summary: 'Get exercises by group', description: 'Retrieve all exercises that belong to a specific group' })
  @ApiParam({ name: 'groupId', description: 'Exercise group ID' })
  @ApiResponse({ status: 200, description: 'List of exercise group members retrieved successfully', type: [CreateExerciseGroupMemberResponseDto] })
  async findByGroupId(
    @Param('groupId') groupId: string
  ): Promise<CreateExerciseGroupMemberResponseDto[]> {
    const members = await this.compendiumExerciseGroupMemberService.findByGroupId(groupId);
    return members.map((member) => plainToInstance(CreateExerciseGroupMemberResponseDto, member));
  }

  @Get(':exerciseId/:groupId')
  @ApiOperation({ summary: 'Get group member by composite key', description: 'Retrieve a specific exercise group membership' })
  @ApiParam({ name: 'exerciseId', description: 'Exercise template ID' })
  @ApiParam({ name: 'groupId', description: 'Exercise group ID' })
  @ApiResponse({ status: 200, description: 'Exercise group member retrieved successfully', type: CreateExerciseGroupMemberResponseDto })
  @ApiResponse({ status: 404, description: 'Exercise group member not found' })
  async findByCompositeKey(
    @Param('exerciseId') exerciseId: string,
    @Param('groupId') groupId: string
  ): Promise<CreateExerciseGroupMemberResponseDto> {
    const member = await this.compendiumExerciseGroupMemberService.findByCompositeKey(exerciseId, groupId);
    return plainToInstance(CreateExerciseGroupMemberResponseDto, member);
  }

  @Post()
  @ApiOperation({ summary: 'Create exercise group member', description: 'Add an exercise to a group' })
  @ApiResponse({ status: 201, description: 'Exercise group member created successfully', type: CreateExerciseGroupMemberResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(
    @Body() data: CreateExerciseGroupMemberDto,
    @UserId() userId: string
  ): Promise<CreateExerciseGroupMemberResponseDto> {
    const member = await this.compendiumExerciseGroupMemberService.create(data, userId);
    return plainToInstance(CreateExerciseGroupMemberResponseDto, member);
  }

  @Post('upsert')
  @ApiOperation({ summary: 'Upsert exercise group member', description: 'Create or update an exercise group membership' })
  @ApiResponse({ status: 201, description: 'Exercise group member created or updated successfully', type: CreateExerciseGroupMemberResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async upsert(
    @Body() data: CreateExerciseGroupMemberDto,
    @UserId() userId: string
  ): Promise<CreateExerciseGroupMemberResponseDto> {
    const member = await this.compendiumExerciseGroupMemberService.upsert(data, userId);
    return plainToInstance(CreateExerciseGroupMemberResponseDto, member);
  }

  @Delete(':exerciseId/:groupId')
  @ApiOperation({ summary: 'Delete exercise group member', description: 'Remove an exercise from a group' })
  @ApiParam({ name: 'exerciseId', description: 'Exercise template ID' })
  @ApiParam({ name: 'groupId', description: 'Exercise group ID' })
  @ApiResponse({ status: 200, description: 'Exercise group member deleted successfully' })
  @ApiResponse({ status: 404, description: 'Exercise group member not found' })
  async delete(
    @Param('exerciseId') exerciseId: string,
    @Param('groupId') groupId: string
  ) {
    return await this.compendiumExerciseGroupMemberService.delete(exerciseId, groupId);
  }
}
