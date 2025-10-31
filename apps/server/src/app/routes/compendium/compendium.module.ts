import { Module } from '@nestjs/common';
import { CoreModule } from '../../core/core.module';
import { EquipmentController } from './equipment/equipment.controller';
import { ExerciseController } from './exercise/exercise.controller';

@Module({ imports: [CoreModule], controllers: [EquipmentController, ExerciseController] })
export class CompendiumModule {}
