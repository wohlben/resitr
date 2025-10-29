import { Module } from '@nestjs/common';
import { CoreModule } from '../../core/core.module';
import { EquipmentController } from './equipment/equipment.controller';

@Module({ imports: [CoreModule], controllers: [EquipmentController] })
export class CompendiumModule {}
