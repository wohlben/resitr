import { Test, TestingModule } from '@nestjs/testing';
import { CompendiumEquipmentService } from './compendium-equipment.service';
import { CompendiumEquipmentRepository } from '../../persistence/repositories/compendium-equipment.repository';
import { provideTestDatabase } from '../../persistence/database';

describe('CompendiumEquipmentService', () => {
  let service: CompendiumEquipmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [provideTestDatabase(), CompendiumEquipmentRepository, CompendiumEquipmentService],
    }).compile();

    service = module.get<CompendiumEquipmentService>(CompendiumEquipmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
