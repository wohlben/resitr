import { Test, TestingModule } from '@nestjs/testing';
import { EquipmentController } from './equipment.controller';
import { CompendiumEquipmentService } from '../../../core/compendium/equipment/compendium-equipment.service';

describe('EquipmentController', () => {
  let controller: EquipmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EquipmentController],
      providers: [
        {
          provide: CompendiumEquipmentService,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<EquipmentController>(EquipmentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
