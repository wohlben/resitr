import { Module } from '@nestjs/common';
import { CoreModule } from '../../core/core.module';
import { UserWorkoutLogController } from './workout-log/user-workout-log.controller';
import { UserWorkoutScheduleController } from './workout-schedule/user-workout-schedule.controller';

@Module({
    imports: [CoreModule],
    controllers: [UserWorkoutLogController, UserWorkoutScheduleController],
})
export class UserModule { }
