import { Controller, Get } from '@nestjs/common';
import { CompendiumEquipmentService } from '../../../core/compendium/equipment/compendium-equipment.service';

@Controller('equipment')
export class EquipmentController {
  constructor(private compendiumEquipmentService: CompendiumEquipmentService) {}
  @Get()
  getData() {
    //return this.appService.getData();
  }
}
