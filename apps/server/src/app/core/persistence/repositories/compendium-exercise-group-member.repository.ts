import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DATABASE, type Database } from '../database';
import {
  compendiumExerciseGroupMember,
  type CompendiumExerciseGroupMember,
} from '../schemas';

@Injectable()
export class CompendiumExerciseGroupMemberRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async create(data: CompendiumExerciseGroupMember) {
    const [result] = await this.db.insert(compendiumExerciseGroupMember).values(data).returning();
    return result;
  }

  async findAll() {
    return this.db.select().from(compendiumExerciseGroupMember);
  }

  async findByExerciseId(exerciseId: string) {
    return this.db
      .select()
      .from(compendiumExerciseGroupMember)
      .where(eq(compendiumExerciseGroupMember.exerciseTemplateId, exerciseId));
  }

  async findByGroupId(groupId: string) {
    return this.db
      .select()
      .from(compendiumExerciseGroupMember)
      .where(eq(compendiumExerciseGroupMember.groupId, groupId));
  }

  async findByCompositeKey(exerciseId: string, groupId: string) {
    const [result] = await this.db
      .select()
      .from(compendiumExerciseGroupMember)
      .where(
        and(
          eq(compendiumExerciseGroupMember.exerciseTemplateId, exerciseId),
          eq(compendiumExerciseGroupMember.groupId, groupId)
        )
      );
    return result;
  }

  async delete(exerciseId: string, groupId: string) {
    const [result] = await this.db
      .delete(compendiumExerciseGroupMember)
      .where(
        and(
          eq(compendiumExerciseGroupMember.exerciseTemplateId, exerciseId),
          eq(compendiumExerciseGroupMember.groupId, groupId)
        )
      )
      .returning();
    return result;
  }
}
