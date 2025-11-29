import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CompendiumExerciseRelationshipService } from '../../../core/compendium/exercise-relationship/compendium-exercise-relationship.service';
import { UserId } from '../../../common/decorators/user-id.decorator';
import {
  CreateExerciseRelationshipDto,
  CreateExerciseRelationshipResponseDto,
} from './dto/exercise-relationship.dto';
import { plainToInstance } from 'class-transformer';
import { ExerciseRelationshipType } from '@resitr/api';

@ApiTags('compendium:exercise-relationship')
@Controller('compendium/exercise-relationship')
export class ExerciseRelationshipController {
  constructor(private compendiumExerciseRelationshipService: CompendiumExerciseRelationshipService) {}

  @Get('from/:fromExerciseTemplateId')
  @ApiOperation({ summary: 'Get relationships from exercise', description: 'Retrieve all relationships originating from a specific exercise' })
  @ApiParam({ name: 'fromExerciseTemplateId', description: 'Source exercise template ID' })
  @ApiResponse({ status: 200, description: 'List of exercise relationships retrieved successfully', type: [CreateExerciseRelationshipResponseDto] })
  async findByFromExerciseId(
    @Param('fromExerciseTemplateId') fromExerciseTemplateId: string
  ): Promise<CreateExerciseRelationshipResponseDto[]> {
    const relationships = await this.compendiumExerciseRelationshipService.findByFromExerciseId(fromExerciseTemplateId);
    return relationships.map((relationship) => plainToInstance(CreateExerciseRelationshipResponseDto, relationship));
  }

  @Get('to/:toExerciseTemplateId')
  @ApiOperation({ summary: 'Get relationships to exercise', description: 'Retrieve all relationships targeting a specific exercise' })
  @ApiParam({ name: 'toExerciseTemplateId', description: 'Target exercise template ID' })
  @ApiResponse({ status: 200, description: 'List of exercise relationships retrieved successfully', type: [CreateExerciseRelationshipResponseDto] })
  async findByToExerciseId(
    @Param('toExerciseTemplateId') toExerciseTemplateId: string
  ): Promise<CreateExerciseRelationshipResponseDto[]> {
    const relationships = await this.compendiumExerciseRelationshipService.findByToExerciseId(toExerciseTemplateId);
    return relationships.map((relationship) => plainToInstance(CreateExerciseRelationshipResponseDto, relationship));
  }

  @Get('exercise/:exerciseTemplateId')
  @ApiOperation({ summary: 'Get all relationships for exercise', description: 'Retrieve all relationships involving a specific exercise (both from and to)' })
  @ApiParam({ name: 'exerciseTemplateId', description: 'Exercise template ID' })
  @ApiResponse({ status: 200, description: 'List of exercise relationships retrieved successfully', type: [CreateExerciseRelationshipResponseDto] })
  async findByExerciseId(
    @Param('exerciseTemplateId') exerciseTemplateId: string
  ): Promise<CreateExerciseRelationshipResponseDto[]> {
    const relationships = await this.compendiumExerciseRelationshipService.findByExerciseId(exerciseTemplateId);
    return relationships.map((relationship) => plainToInstance(CreateExerciseRelationshipResponseDto, relationship));
  }

  @Get('by-type/:fromExerciseTemplateId/:relationshipType')
  @ApiOperation({ summary: 'Get relationships by type', description: 'Retrieve relationships of a specific type from an exercise' })
  @ApiParam({ name: 'fromExerciseTemplateId', description: 'Source exercise template ID' })
  @ApiParam({ name: 'relationshipType', description: 'Type of relationship' })
  @ApiResponse({ status: 200, description: 'List of exercise relationships retrieved successfully', type: [CreateExerciseRelationshipResponseDto] })
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
  @ApiOperation({ summary: 'Create exercise relationship', description: 'Create a new exercise relationship' })
  @ApiResponse({ status: 201, description: 'Exercise relationship created successfully', type: CreateExerciseRelationshipResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(
    @Body() data: CreateExerciseRelationshipDto,
    @UserId() userId: string
  ): Promise<CreateExerciseRelationshipResponseDto> {
    const relationship = await this.compendiumExerciseRelationshipService.create(data, userId);
    return plainToInstance(CreateExerciseRelationshipResponseDto, relationship);
  }

  @Post('upsert')
  @ApiOperation({ summary: 'Upsert exercise relationship', description: 'Create or update an exercise relationship' })
  @ApiResponse({ status: 201, description: 'Exercise relationship created or updated successfully', type: CreateExerciseRelationshipResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async upsert(
    @Body() data: CreateExerciseRelationshipDto,
    @UserId() userId: string
  ): Promise<CreateExerciseRelationshipResponseDto> {
    const relationship = await this.compendiumExerciseRelationshipService.upsert(data, userId);
    return plainToInstance(CreateExerciseRelationshipResponseDto, relationship);
  }

  @Put(':fromExerciseTemplateId/:toExerciseTemplateId/:relationshipType')
  @ApiOperation({ summary: 'Update exercise relationship', description: 'Update an existing exercise relationship' })
  @ApiParam({ name: 'fromExerciseTemplateId', description: 'Source exercise template ID' })
  @ApiParam({ name: 'toExerciseTemplateId', description: 'Target exercise template ID' })
  @ApiParam({ name: 'relationshipType', description: 'Type of relationship' })
  @ApiResponse({ status: 200, description: 'Exercise relationship updated successfully', type: CreateExerciseRelationshipResponseDto })
  @ApiResponse({ status: 404, description: 'Exercise relationship not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
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
  @ApiOperation({ summary: 'Delete exercise relationship', description: 'Delete an exercise relationship' })
  @ApiParam({ name: 'fromExerciseTemplateId', description: 'Source exercise template ID' })
  @ApiParam({ name: 'toExerciseTemplateId', description: 'Target exercise template ID' })
  @ApiParam({ name: 'relationshipType', description: 'Type of relationship' })
  @ApiResponse({ status: 200, description: 'Exercise relationship deleted successfully' })
  @ApiResponse({ status: 404, description: 'Exercise relationship not found' })
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
