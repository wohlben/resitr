import { Module } from '@nestjs/common';
import { CoreModule } from '../../core/core.module';
import { EquipmentController } from './equipment/equipment.controller';
import { ExerciseController } from './exercise/exercise.controller';
import { ExerciseRelationshipController } from './exercise-relationship/exercise-relationship.controller';
import { ExerciseGroupController } from './exercise-group/exercise-group.controller';
import { ExerciseGroupMemberController } from './exercise-group-member/exercise-group-member.controller';
import { ExerciseSchemeController } from './exercise-scheme/exercise-scheme.controller';
import { ExerciseVideoController } from './exercise-video/exercise-video.controller';
import { WorkoutController } from './workout/workout.controller';

@Module({
  imports: [CoreModule],
  controllers: [
    EquipmentController,
    ExerciseController,
    ExerciseRelationshipController,
    ExerciseGroupController,
    ExerciseGroupMemberController,
    ExerciseSchemeController,
    ExerciseVideoController,
    WorkoutController,
  ],
})
export class CompendiumModule {}
