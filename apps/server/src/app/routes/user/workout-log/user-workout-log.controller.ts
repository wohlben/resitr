import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { UserWorkoutLogService } from '../../../core/user/workout-log/user-workout-log.service';
import { UpdateSetDto, SkipSetsDto, UpsertWorkoutLogDto } from './dto/workout-log.dto';
import { UserId } from '../../../common/decorators/user-id.decorator';

@Controller('user/workout-logs')
export class UserWorkoutLogController {
    constructor(private readonly logService: UserWorkoutLogService) { }

    @Put()
    async upsertLog(@Body() dto: UpsertWorkoutLogDto, @UserId() userId: string) {
        return this.logService.upsertLog(dto, userId);
    }

    @Get(':id')
    async getLog(@Param('id') id: string) {
        return this.logService.getLog(id);
    }

    @Post('sets/:setId/complete')
    async completeSet(@Param('setId') setId: string, @Body() dto: UpdateSetDto) {
        return this.logService.completeSet(setId, dto);
    }

    @Post('sets/skip')
    async skipSets(@Body() dto: SkipSetsDto) {
        return this.logService.skipSets(dto.setIds);
    }
}
