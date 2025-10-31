import { Injectable } from '@nestjs/common';
import { CompendiumExerciseGroupRepository } from '../../persistence/repositories/compendium-exercise-group.repository';
import { CreateExerciseGroupDto } from '../../../routes/compendium/exercise-group/dto/exercise-group.dto';

@Injectable()
export class CompendiumExerciseGroupService {
  constructor(private readonly repository: CompendiumExerciseGroupRepository) {}

  async create(data: CreateExerciseGroupDto, userId: string) {
    return await this.repository.create({ ...data, createdBy: userId });
  }

  async findAll() {
    return await this.repository.findAll();
  }

  async findById(id: string) {
    return await this.repository.findById(id);
  }

  async findByName(name: string) {
    return await this.repository.findByName(name);
  }

  async update(id: string, data: Partial<CreateExerciseGroupDto>) {
    return await this.repository.update(id, data);
  }

  async delete(id: string) {
    return this.repository.delete(id);
  }

  async upsert(data: CreateExerciseGroupDto, userId: string) {
    return await this.repository.upsert({ ...data, createdBy: userId });
  }
}
