import { Injectable } from '@nestjs/common';
import { CompendiumExerciseGroupMemberRepository } from '../../persistence/repositories/compendium-exercise-group-member.repository';
import { CreateExerciseGroupMemberDto } from '../../../routes/compendium/exercise-group-member/dto/exercise-group-member.dto';

@Injectable()
export class CompendiumExerciseGroupMemberService {
  constructor(private readonly repository: CompendiumExerciseGroupMemberRepository) {}

  async create(data: CreateExerciseGroupMemberDto, userId: string) {
    return await this.repository.create({ ...data, addedBy: userId });
  }

  async findAll() {
    return await this.repository.findAll();
  }

  async findByExerciseId(exerciseId: string) {
    return await this.repository.findByExerciseId(exerciseId);
  }

  async findByGroupId(groupId: string) {
    return await this.repository.findByGroupId(groupId);
  }

  async findByCompositeKey(exerciseId: string, groupId: string) {
    return await this.repository.findByCompositeKey(exerciseId, groupId);
  }

  async delete(exerciseId: string, groupId: string) {
    return await this.repository.delete(exerciseId, groupId);
  }

  async upsert(data: CreateExerciseGroupMemberDto, userId: string) {
    return await this.repository.upsert({ ...data, addedBy: userId });
  }
}
