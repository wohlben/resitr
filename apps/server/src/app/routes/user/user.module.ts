import { Module } from '@nestjs/common';
import { CoreModule } from '../../core/core.module';
import { UserWorkoutLogController } from './workout-log/user-workout-log.controller';
import { WorkoutScheduleController } from './workout-schedule/workout-schedule.controller';
import { WorkoutScheduleCriteriaController } from './workout-schedule/workout-schedule-criteria.controller';
import { UserExerciseSchemeController } from './exercise-scheme/user-exercise-scheme.controller';
import { UserWorkoutController } from './workout/user-workout.controller';

@Module({
  imports: [CoreModule],
  controllers: [
    UserWorkoutLogController,
    WorkoutScheduleController,
    WorkoutScheduleCriteriaController,
    UserExerciseSchemeController,
    UserWorkoutController,
  ],
})
export class UserModule {}
