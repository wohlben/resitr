import { Injectable } from '@nestjs/common';
import { CompendiumExerciseVideoRepository } from '../../persistence/repositories/compendium-exercise-video.repository';
import { CreateExerciseVideoDto } from '../../../routes/compendium/exercise-video/dto/exercise-video.dto';

@Injectable()
export class CompendiumExerciseVideoService {
  constructor(private readonly repository: CompendiumExerciseVideoRepository) {}

  async create(data: CreateExerciseVideoDto, userId: string) {
    return await this.repository.create({ ...data, createdBy: userId });
  }

  async findAll() {
    return await this.repository.findAll();
  }

  async findByExerciseId(exerciseTemplateId: string) {
    return await this.repository.findByExerciseId(exerciseTemplateId);
  }

  async findByCompositeKey(exerciseTemplateId: string, url: string) {
    return await this.repository.findByCompositeKey(exerciseTemplateId, url);
  }

  async update(
    exerciseTemplateId: string,
    url: string,
    data: Partial<CreateExerciseVideoDto>,
    userId: string
  ) {
    return await this.repository.update(exerciseTemplateId, url, {
      ...data,
      createdBy: userId,
    });
  }

  async delete(exerciseTemplateId: string, url: string) {
    return this.repository.delete(exerciseTemplateId, url);
  }
}
