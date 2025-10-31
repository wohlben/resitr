import { Module } from '@nestjs/common';
import { CoreModule } from '../../core/core.module';
import { EquipmentController } from './equipment/equipment.controller';
import { ExerciseController } from './exercise/exercise.controller';
import { ExerciseRelationshipController } from './exercise-relationship/exercise-relationship.controller';

@Module({ imports: [CoreModule], controllers: [EquipmentController, ExerciseController, ExerciseRelationshipController] })
export class CompendiumModule {}
