import { Injectable } from '@nestjs/common';
import { CompendiumExerciseSchemeRepository } from '../../persistence/repositories/compendium-exercise-scheme.repository';
import { CreateExerciseSchemeDto } from '../../../routes/compendium/exercise-scheme/dto/exercise-scheme.dto';

@Injectable()
export class CompendiumExerciseSchemeService {
  constructor(private readonly repository: CompendiumExerciseSchemeRepository) {}

  async create(data: CreateExerciseSchemeDto, userId: string) {
    return await this.repository.create({ ...data, createdBy: userId });
  }

  async findAll() {
    return await this.repository.findAll();
  }

  async findById(id: string) {
    return await this.repository.findById(id);
  }

  async findByExerciseId(exerciseId: string) {
    return await this.repository.findByExerciseId(exerciseId);
  }

  async update(id: string, data: Partial<CreateExerciseSchemeDto>, userId: string) {
    return await this.repository.update(id, {
      ...data,
      createdBy: userId,
    });
  }

  async delete(id: string) {
    return this.repository.delete(id);
  }
}
