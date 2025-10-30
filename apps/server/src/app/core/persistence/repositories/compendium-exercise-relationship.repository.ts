import { Inject, Injectable } from '@nestjs/common';
import { and, eq, or } from 'drizzle-orm';
import { DATABASE, type Database } from '../database';
import {
  compendiumExerciseRelationship,
  type CompendiumExerciseRelationship,
} from '../schemas';
import { ExerciseRelationshipType } from '@resitr/api';

@Injectable()
export class CompendiumExerciseRelationshipRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async create(data: CompendiumExerciseRelationship) {
    const [result] = await this.db.insert(compendiumExerciseRelationship).values(data).returning();
    return result;
  }

  async findAll() {
    return this.db.select().from(compendiumExerciseRelationship);
  }

  async findByCompositeKey(fromExerciseTemplateId: string, toExerciseTemplateId: string, relationshipType: ExerciseRelationshipType) {
    const [result] = await this.db
      .select()
      .from(compendiumExerciseRelationship)
      .where(
        and(
          eq(compendiumExerciseRelationship.fromExerciseTemplateId, fromExerciseTemplateId),
          eq(compendiumExerciseRelationship.toExerciseTemplateId, toExerciseTemplateId),
          eq(compendiumExerciseRelationship.relationshipType, relationshipType)
        )
      );
    return result;
  }

  async findByFromExerciseId(fromExerciseTemplateId: string) {
    return this.db
      .select()
      .from(compendiumExerciseRelationship)
      .where(eq(compendiumExerciseRelationship.fromExerciseTemplateId, fromExerciseTemplateId));
  }

  async findByToExerciseId(toExerciseTemplateId: string) {
    return this.db
      .select()
      .from(compendiumExerciseRelationship)
      .where(eq(compendiumExerciseRelationship.toExerciseTemplateId, toExerciseTemplateId));
  }

  async findByExerciseId(exerciseTemplateId: string) {
    return this.db
      .select()
      .from(compendiumExerciseRelationship)
      .where(
        or(
          eq(compendiumExerciseRelationship.fromExerciseTemplateId, exerciseTemplateId),
          eq(compendiumExerciseRelationship.toExerciseTemplateId, exerciseTemplateId)
        )
      );
  }

  async findByRelationshipType(fromExerciseTemplateId: string, relationshipType: ExerciseRelationshipType) {
    return this.db
      .select()
      .from(compendiumExerciseRelationship)
      .where(
        and(
          eq(compendiumExerciseRelationship.fromExerciseTemplateId, fromExerciseTemplateId),
          eq(compendiumExerciseRelationship.relationshipType, relationshipType)
        )
      );
  }

  async update(fromExerciseTemplateId: string, toExerciseTemplateId: string, relationshipType: ExerciseRelationshipType, data: Partial<CompendiumExerciseRelationship>) {
    const [result] = await this.db
      .update(compendiumExerciseRelationship)
      .set(data)
      .where(
        and(
          eq(compendiumExerciseRelationship.fromExerciseTemplateId, fromExerciseTemplateId),
          eq(compendiumExerciseRelationship.toExerciseTemplateId, toExerciseTemplateId),
          eq(compendiumExerciseRelationship.relationshipType, relationshipType)
        )
      )
      .returning();
    return result;
  }

  async delete(fromExerciseTemplateId: string, toExerciseTemplateId: string, relationshipType: ExerciseRelationshipType) {
    const [result] = await this.db
      .delete(compendiumExerciseRelationship)
      .where(
        and(
          eq(compendiumExerciseRelationship.fromExerciseTemplateId, fromExerciseTemplateId),
          eq(compendiumExerciseRelationship.toExerciseTemplateId, toExerciseTemplateId),
          eq(compendiumExerciseRelationship.relationshipType, relationshipType)
        )
      )
      .returning();
    return result;
  }
}
