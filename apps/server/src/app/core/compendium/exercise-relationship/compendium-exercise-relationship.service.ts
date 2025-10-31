import { Injectable } from '@nestjs/common';
import { CompendiumExerciseRelationshipRepository } from '../../persistence/repositories/compendium-exercise-relationship.repository';
import { CreateExerciseRelationshipDto } from '../../../routes/compendium/exercise-relationship/dto/exercise-relationship.dto';
import { ExerciseRelationshipType } from '@resitr/api';

@Injectable()
export class CompendiumExerciseRelationshipService {
  constructor(private readonly repository: CompendiumExerciseRelationshipRepository) {}

  async create(data: CreateExerciseRelationshipDto, userId: string) {
    return await this.repository.create({ ...data, createdBy: userId });
  }

  async findAll() {
    return await this.repository.findAll();
  }

  async findByCompositeKey(
    fromExerciseTemplateId: string,
    toExerciseTemplateId: string,
    relationshipType: ExerciseRelationshipType
  ) {
    return await this.repository.findByCompositeKey(fromExerciseTemplateId, toExerciseTemplateId, relationshipType);
  }

  async findByFromExerciseId(fromExerciseTemplateId: string) {
    return await this.repository.findByFromExerciseId(fromExerciseTemplateId);
  }

  async findByToExerciseId(toExerciseTemplateId: string) {
    return await this.repository.findByToExerciseId(toExerciseTemplateId);
  }

  async findByExerciseId(exerciseTemplateId: string) {
    return await this.repository.findByExerciseId(exerciseTemplateId);
  }

  async findByRelationshipType(fromExerciseTemplateId: string, relationshipType: ExerciseRelationshipType) {
    return this.repository.findByRelationshipType(fromExerciseTemplateId, relationshipType);
  }

  async update(
    fromExerciseTemplateId: string,
    toExerciseTemplateId: string,
    relationshipType: ExerciseRelationshipType,
    data: Partial<CreateExerciseRelationshipDto>,
    userId: string
  ) {
    return this.repository.update(fromExerciseTemplateId, toExerciseTemplateId, relationshipType, {
      ...data,
      createdBy: userId,
    });
  }

  async delete(fromExerciseTemplateId: string, toExerciseTemplateId: string, relationshipType: ExerciseRelationshipType, deletedBy: string) {
    return this.repository.delete(fromExerciseTemplateId, toExerciseTemplateId, relationshipType);
  }

  async upsert(data: CreateExerciseRelationshipDto, userId: string) {
    return this.repository.upsert({ ...data, createdBy: userId });
  }
}
