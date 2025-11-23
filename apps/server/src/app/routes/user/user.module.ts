import { Module } from '@nestjs/common';
import { CoreModule } from '../../core/core.module';
import { UserWorkoutLogController } from './workout-log/user-workout-log.controller';
import { UserWorkoutScheduleController } from './workout-schedule/user-workout-schedule.controller';
import { UserExerciseSchemeController } from './exercise-scheme/user-exercise-scheme.controller';

@Module({
    imports: [CoreModule],
    controllers: [UserWorkoutLogController, UserWorkoutScheduleController, UserExerciseSchemeController],
})
export class UserModule { }
