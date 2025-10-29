import { Module } from '@nestjs/common';
import { CompendiumEquipmentService } from './compendium/equipment/compendium-equipment.service';

@Module({
  providers: [CompendiumEquipmentService],
  exports: [CompendiumEquipmentService],
})
export class CoreModule {}
