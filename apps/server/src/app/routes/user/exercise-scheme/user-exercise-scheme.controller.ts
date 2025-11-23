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

@Controller('user/exercise-scheme')
export class UserExerciseSchemeController {
  constructor(
    private readonly schemeService: UserExerciseSchemeService
  ) {}

  @Post()
  async createScheme(
    @UserId() userId: string,
    @Body() createDto: CreateUserExerciseSchemeDto
  ): Promise<UserExerciseSchemeResponseDto> {
    const scheme = await this.schemeService.createScheme(userId, createDto);
    return plainToInstance(UserExerciseSchemeResponseDto, scheme);
  }

  @Get()
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
  async getSchemeById(
    @UserId() userId: string,
    @Param('id') schemeId: string
  ): Promise<UserExerciseSchemeResponseDto> {
    const scheme = await this.schemeService.getSchemeById(userId, schemeId);
    return plainToInstance(UserExerciseSchemeResponseDto, scheme);
  }

  @Put(':id')
  async updateScheme(
    @UserId() userId: string,
    @Param('id') schemeId: string,
    @Body() updateDto: UpdateUserExerciseSchemeDto
  ): Promise<UserExerciseSchemeResponseDto> {
    const scheme = await this.schemeService.updateScheme(userId, schemeId, updateDto);
    return plainToInstance(UserExerciseSchemeResponseDto, scheme);
  }

  @Delete(':id')
  async deleteScheme(
    @UserId() userId: string,
    @Param('id') schemeId: string
  ) {
    await this.schemeService.deleteScheme(userId, schemeId);
    return { success: true };
  }

  @Post(':id/assign-to')
  async assignToSectionItem(
    @UserId() userId: string,
    @Param('id') schemeId: string,
    @Body() dto: AssignToSectionItemDto
  ) {
    const result = await this.schemeService.assignToSectionItem(
      userId,
      schemeId,
      dto.sectionItemId,
      dto.workoutTemplateId
    );
    return { success: true, data: result };
  }

  @Delete(':id/assign-to')
  async unassignFromSectionItem(
    @UserId() userId: string,
    @Param('id') schemeId: string,
    @Body() dto: UnassignFromSectionItemDto
  ) {
    await this.schemeService.unassignFromSectionItem(
      userId,
      schemeId,
      dto.sectionItemId,
      dto.workoutTemplateId
    );
    return { success: true };
  }
}
