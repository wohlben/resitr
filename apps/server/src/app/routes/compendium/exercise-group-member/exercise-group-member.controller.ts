import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CompendiumExerciseGroupMemberService } from '../../../core/compendium/exercise-group-member/compendium-exercise-group-member.service';
import { UserId } from '../../../common/decorators/user-id.decorator';
import { CreateExerciseGroupMemberDto, CreateExerciseGroupMemberResponseDto } from './dto/exercise-group-member.dto';
import { plainToInstance } from 'class-transformer';

@Controller('compendium/exercise-group-member')
export class ExerciseGroupMemberController {
  constructor(private compendiumExerciseGroupMemberService: CompendiumExerciseGroupMemberService) {}

  @Get()
  async findAll(): Promise<CreateExerciseGroupMemberResponseDto[]> {
    const members = await this.compendiumExerciseGroupMemberService.findAll();
    return members.map((member) => plainToInstance(CreateExerciseGroupMemberResponseDto, member));
  }

  @Get('exercise/:exerciseId')
  async findByExerciseId(
    @Param('exerciseId') exerciseId: string
  ): Promise<CreateExerciseGroupMemberResponseDto[]> {
    const members = await this.compendiumExerciseGroupMemberService.findByExerciseId(exerciseId);
    return members.map((member) => plainToInstance(CreateExerciseGroupMemberResponseDto, member));
  }

  @Get('group/:groupId')
  async findByGroupId(
    @Param('groupId') groupId: string
  ): Promise<CreateExerciseGroupMemberResponseDto[]> {
    const members = await this.compendiumExerciseGroupMemberService.findByGroupId(groupId);
    return members.map((member) => plainToInstance(CreateExerciseGroupMemberResponseDto, member));
  }

  @Get(':exerciseId/:groupId')
  async findByCompositeKey(
    @Param('exerciseId') exerciseId: string,
    @Param('groupId') groupId: string
  ): Promise<CreateExerciseGroupMemberResponseDto> {
    const member = await this.compendiumExerciseGroupMemberService.findByCompositeKey(exerciseId, groupId);
    return plainToInstance(CreateExerciseGroupMemberResponseDto, member);
  }

  @Post()
  async create(
    @Body() data: CreateExerciseGroupMemberDto,
    @UserId() userId: string
  ): Promise<CreateExerciseGroupMemberResponseDto> {
    const member = await this.compendiumExerciseGroupMemberService.create(data, userId);
    return plainToInstance(CreateExerciseGroupMemberResponseDto, member);
  }

  @Post('upsert')
  async upsert(
    @Body() data: CreateExerciseGroupMemberDto,
    @UserId() userId: string
  ): Promise<CreateExerciseGroupMemberResponseDto> {
    const member = await this.compendiumExerciseGroupMemberService.upsert(data, userId);
    return plainToInstance(CreateExerciseGroupMemberResponseDto, member);
  }

  @Delete(':exerciseId/:groupId')
  async delete(
    @Param('exerciseId') exerciseId: string,
    @Param('groupId') groupId: string
  ) {
    return await this.compendiumExerciseGroupMemberService.delete(exerciseId, groupId);
  }
}
