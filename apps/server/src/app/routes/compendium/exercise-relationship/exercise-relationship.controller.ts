import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CompendiumExerciseRelationshipService } from '../../../core/compendium/exercise-relationship/compendium-exercise-relationship.service';
import { UserId } from '../../../common/decorators/user-id.decorator';
import {
  CreateExerciseRelationshipDto,
  CreateExerciseRelationshipResponseDto,
} from './dto/exercise-relationship.dto';
import { plainToInstance } from 'class-transformer';
import { ExerciseRelationshipType } from '@resitr/api';

@Controller('compendium/exercise-relationship')
export class ExerciseRelationshipController {
  constructor(private compendiumExerciseRelationshipService: CompendiumExerciseRelationshipService) {}

  @Get('from/:fromExerciseTemplateId')
  async findByFromExerciseId(
    @Param('fromExerciseTemplateId') fromExerciseTemplateId: string
  ): Promise<CreateExerciseRelationshipResponseDto[]> {
    const relationships = await this.compendiumExerciseRelationshipService.findByFromExerciseId(fromExerciseTemplateId);
    return relationships.map((relationship) => plainToInstance(CreateExerciseRelationshipResponseDto, relationship));
  }

  @Get('to/:toExerciseTemplateId')
  async findByToExerciseId(
    @Param('toExerciseTemplateId') toExerciseTemplateId: string
  ): Promise<CreateExerciseRelationshipResponseDto[]> {
    const relationships = await this.compendiumExerciseRelationshipService.findByToExerciseId(toExerciseTemplateId);
    return relationships.map((relationship) => plainToInstance(CreateExerciseRelationshipResponseDto, relationship));
  }

  @Get('exercise/:exerciseTemplateId')
  async findByExerciseId(
    @Param('exerciseTemplateId') exerciseTemplateId: string
  ): Promise<CreateExerciseRelationshipResponseDto[]> {
    const relationships = await this.compendiumExerciseRelationshipService.findByExerciseId(exerciseTemplateId);
    return relationships.map((relationship) => plainToInstance(CreateExerciseRelationshipResponseDto, relationship));
  }

  @Get('by-type/:fromExerciseTemplateId/:relationshipType')
  async findByRelationshipType(
    @Param('fromExerciseTemplateId') fromExerciseTemplateId: string,
    @Param('relationshipType') relationshipType: ExerciseRelationshipType
  ): Promise<CreateExerciseRelationshipResponseDto[]> {
    const relationships = await this.compendiumExerciseRelationshipService.findByRelationshipType(
      fromExerciseTemplateId,
      relationshipType
    );
    return relationships.map((relationship) => plainToInstance(CreateExerciseRelationshipResponseDto, relationship));
  }

  @Post()
  async create(
    @Body() data: CreateExerciseRelationshipDto,
    @UserId() userId: string
  ): Promise<CreateExerciseRelationshipResponseDto> {
    const relationship = await this.compendiumExerciseRelationshipService.create(data, userId);
    return plainToInstance(CreateExerciseRelationshipResponseDto, relationship);
  }

  @Post('upsert')
  async upsert(
    @Body() data: CreateExerciseRelationshipDto,
    @UserId() userId: string
  ): Promise<CreateExerciseRelationshipResponseDto> {
    const relationship = await this.compendiumExerciseRelationshipService.upsert(data, userId);
    return plainToInstance(CreateExerciseRelationshipResponseDto, relationship);
  }

  @Put(':fromExerciseTemplateId/:toExerciseTemplateId/:relationshipType')
  async update(
    @Param('fromExerciseTemplateId') fromExerciseTemplateId: string,
    @Param('toExerciseTemplateId') toExerciseTemplateId: string,
    @Param('relationshipType') relationshipType: ExerciseRelationshipType,
    @Body() data: CreateExerciseRelationshipDto,
    @UserId() userId: string
  ): Promise<CreateExerciseRelationshipResponseDto> {
    const relationship = await this.compendiumExerciseRelationshipService.update(
      fromExerciseTemplateId,
      toExerciseTemplateId,
      relationshipType,
      data,
      userId
    );
    return plainToInstance(CreateExerciseRelationshipResponseDto, relationship);
  }

  @Delete(':fromExerciseTemplateId/:toExerciseTemplateId/:relationshipType')
  async delete(
    @Param('fromExerciseTemplateId') fromExerciseTemplateId: string,
    @Param('toExerciseTemplateId') toExerciseTemplateId: string,
    @Param('relationshipType') relationshipType: ExerciseRelationshipType,
    @UserId() userId: string
  ) {
    return await this.compendiumExerciseRelationshipService.delete(
      fromExerciseTemplateId,
      toExerciseTemplateId,
      relationshipType,
      userId
    );
  }
}
