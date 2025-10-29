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

  async findById(id: string) {
    const [result] = await this.db
      .select()
      .from(compendiumExerciseRelationship)
      .where(eq(compendiumExerciseRelationship.id, id));
    return result;
  }

  async findByFromExerciseId(fromExerciseId: string) {
    return this.db
      .select()
      .from(compendiumExerciseRelationship)
      .where(eq(compendiumExerciseRelationship.fromExerciseId, fromExerciseId));
  }

  async findByToExerciseId(toExerciseId: string) {
    return this.db
      .select()
      .from(compendiumExerciseRelationship)
      .where(eq(compendiumExerciseRelationship.toExerciseId, toExerciseId));
  }

  async findByExerciseId(exerciseId: string) {
    return this.db
      .select()
      .from(compendiumExerciseRelationship)
      .where(
        or(
          eq(compendiumExerciseRelationship.fromExerciseId, exerciseId),
          eq(compendiumExerciseRelationship.toExerciseId, exerciseId)
        )
      );
  }

  async findByRelationshipType(fromExerciseId: string, relationshipType: ExerciseRelationshipType) {
    return this.db
      .select()
      .from(compendiumExerciseRelationship)
      .where(
        and(
          eq(compendiumExerciseRelationship.fromExerciseId, fromExerciseId),
          eq(compendiumExerciseRelationship.relationshipType, relationshipType)
        )
      );
  }

  async update(id: string, data: Partial<CompendiumExerciseRelationship>) {
    const [result] = await this.db
      .update(compendiumExerciseRelationship)
      .set(data)
      .where(eq(compendiumExerciseRelationship.id, id))
      .returning();
    return result;
  }

  async delete(id: string) {
    const [result] = await this.db
      .delete(compendiumExerciseRelationship)
      .where(eq(compendiumExerciseRelationship.id, id))
      .returning();
    return result;
  }
}
