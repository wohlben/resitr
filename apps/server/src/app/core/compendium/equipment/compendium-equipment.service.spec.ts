import { Test, TestingModule } from '@nestjs/testing';
import { CompendiumEquipmentService } from './compendium-equipment.service';

describe('CompendiumEquipmentService', () => {
  let service: CompendiumEquipmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompendiumEquipmentService],
    }).compile();

    service = module.get<CompendiumEquipmentService>(
      CompendiumEquipmentService
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
