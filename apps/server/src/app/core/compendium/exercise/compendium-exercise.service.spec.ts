import { Test, TestingModule } from '@nestjs/testing';
import { CompendiumExerciseService } from './compendium-exercise.service';
import { CompendiumExerciseRepository } from '../../persistence/repositories/compendium-exercise.repository';
import { provideTestDatabase } from '../../persistence/database';

describe('CompendiumExerciseService', () => {
  let service: CompendiumExerciseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [provideTestDatabase(), CompendiumExerciseService, CompendiumExerciseRepository],
    }).compile();

    service = module.get<CompendiumExerciseService>(CompendiumExerciseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
