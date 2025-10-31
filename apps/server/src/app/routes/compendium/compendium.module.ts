import { Module } from '@nestjs/common';
import { CoreModule } from '../../core/core.module';
import { EquipmentController } from './equipment/equipment.controller';
import { ExerciseController } from './exercise/exercise.controller';
import { ExerciseRelationshipController } from './exercise-relationship/exercise-relationship.controller';
import { ExerciseGroupController } from './exercise-group/exercise-group.controller';
import { ExerciseGroupMemberController } from './exercise-group-member/exercise-group-member.controller';

@Module({
  imports: [CoreModule],
  controllers: [
    EquipmentController,
    ExerciseController,
    ExerciseRelationshipController,
    ExerciseGroupController,
    ExerciseGroupMemberController,
  ],
})
export class CompendiumModule {}
