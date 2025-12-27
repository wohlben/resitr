import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { UserExerciseSchemeService } from '../../../core/user/exercise-scheme/user-exercise-scheme.service';
import { UserId } from '../../../common/decorators/user-id.decorator';
import {
  CreateUserExerciseSchemeDto,
  UpdateUserExerciseSchemeDto,
  UserExerciseSchemeResponseDto,
  AssignToSectionItemDto,
  UnassignFromSectionItemDto,
} from './dto/user-exercise-scheme.dto';

@ApiTags('user:exercise-scheme')
@Controller('user/exercise-scheme')
export class UserExerciseSchemeController {
  constructor(
    private readonly schemeService: UserExerciseSchemeService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create exercise scheme', description: 'Create a new user exercise scheme' })
  @ApiResponse({ status: 201, description: 'Exercise scheme created successfully', type: UserExerciseSchemeResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async createScheme(
    @UserId() userId: string,
    @Body() createDto: CreateUserExerciseSchemeDto
  ): Promise<UserExerciseSchemeResponseDto> {
    const scheme = await this.schemeService.createScheme(userId, createDto);
    return plainToInstance(UserExerciseSchemeResponseDto, scheme);
  }

  @Get()
  @ApiOperation({ summary: 'Get user exercise schemes', description: 'Retrieve exercise schemes for the user, optionally filtered by exercise' })
  @ApiQuery({ name: 'exerciseId', description: 'Filter by exercise ID', required: false })
  @ApiResponse({ status: 200, description: 'List of exercise schemes retrieved successfully', type: [UserExerciseSchemeResponseDto] })
  async getUserSchemes(
    @UserId() userId: string,
    @Query('exerciseId') exerciseId?: string
  ): Promise<UserExerciseSchemeResponseDto[]> {
    let schemes;

    if (exerciseId) {
      schemes = await this.schemeService.getUserSchemesByExercise(userId, exerciseId);
    } else {
      schemes = await this.schemeService.getUserSchemes(userId);
    }

    return schemes.map((scheme) => plainToInstance(UserExerciseSchemeResponseDto, scheme));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get exercise scheme by ID', description: 'Retrieve a specific exercise scheme by its ID' })
  @ApiParam({ name: 'id', description: 'Exercise scheme ID' })
  @ApiResponse({ status: 200, description: 'Exercise scheme retrieved successfully', type: UserExerciseSchemeResponseDto })
  @ApiResponse({ status: 404, description: 'Exercise scheme not found' })
  async getSchemeById(
    @UserId() userId: string,
    @Param('id') schemeId: string
  ): Promise<UserExerciseSchemeResponseDto> {
    const scheme = await this.schemeService.getSchemeById(userId, schemeId);
    return plainToInstance(UserExerciseSchemeResponseDto, scheme);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update exercise scheme', description: 'Update an existing exercise scheme' })
  @ApiParam({ name: 'id', description: 'Exercise scheme ID' })
  @ApiResponse({ status: 200, description: 'Exercise scheme updated successfully', type: UserExerciseSchemeResponseDto })
  @ApiResponse({ status: 404, description: 'Exercise scheme not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async updateScheme(
    @UserId() userId: string,
    @Param('id') schemeId: string,
    @Body() updateDto: UpdateUserExerciseSchemeDto
  ): Promise<UserExerciseSchemeResponseDto> {
    const scheme = await this.schemeService.updateScheme(userId, schemeId, updateDto);
    return plainToInstance(UserExerciseSchemeResponseDto, scheme);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete exercise scheme', description: 'Delete an exercise scheme' })
  @ApiParam({ name: 'id', description: 'Exercise scheme ID' })
  @ApiResponse({ status: 200, description: 'Exercise scheme deleted successfully' })
  @ApiResponse({ status: 404, description: 'Exercise scheme not found' })
  async deleteScheme(
    @UserId() userId: string,
    @Param('id') schemeId: string
  ) {
    await this.schemeService.deleteScheme(userId, schemeId);
    return { success: true };
  }

  @Post(':id/assign-to')
  @ApiOperation({ summary: 'Assign scheme to workout section', description: 'Assign an exercise scheme to a workout section item' })
  @ApiParam({ name: 'id', description: 'Exercise scheme ID' })
  @ApiResponse({ status: 200, description: 'Exercise scheme assigned successfully' })
  @ApiResponse({ status: 404, description: 'Exercise scheme or section item not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async assignToSectionItem(
    @UserId() userId: string,
    @Param('id') schemeId: string,
    @Body() dto: AssignToSectionItemDto
  ) {
    const result = await this.schemeService.assignToSectionItem(
      userId,
      schemeId,
      dto.sectionItemId,
      dto.userWorkoutId
    );
    return { success: true, data: result };
  }

  @Delete(':id/assign-to')
  @ApiOperation({ summary: 'Unassign scheme from workout section', description: 'Remove an exercise scheme assignment from a workout section item' })
  @ApiParam({ name: 'id', description: 'Exercise scheme ID' })
  @ApiResponse({ status: 200, description: 'Exercise scheme unassigned successfully' })
  @ApiResponse({ status: 404, description: 'Exercise scheme or section item not found' })
  async unassignFromSectionItem(
    @UserId() userId: string,
    @Param('id') schemeId: string,
    @Body() dto: UnassignFromSectionItemDto
  ) {
    await this.schemeService.unassignFromSectionItem(
      userId,
      schemeId,
      dto.sectionItemId,
      dto.userWorkoutId
    );
    return { success: true };
  }
}
