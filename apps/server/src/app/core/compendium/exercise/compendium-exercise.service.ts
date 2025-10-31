import { Injectable } from '@nestjs/common';
import { CompendiumExerciseRepository } from '../../persistence/repositories/compendium-exercise.repository';
import { CreateExerciseTemplateDto } from '../../../routes/compendium/exercise/dto/exercise-template.dto';

@Injectable()
export class CompendiumExerciseService {
  constructor(private readonly repository: CompendiumExerciseRepository) {}

  async create(data: CreateExerciseTemplateDto, userId: string) {
    return await this.repository.create({ ...data, createdBy: userId });
  }

  async findAll() {
    return await this.repository.findAll();
  }

  async findById(templateId: string) {
    return await this.repository.findById(templateId);
  }

  async update(templateId: string, data: Partial<CreateExerciseTemplateDto>, userId: string) {
    return await this.repository.update(templateId, { ...data, createdBy: userId });
  }

  async delete(templateId: string) {
    return this.repository.delete(templateId);
  }
}
