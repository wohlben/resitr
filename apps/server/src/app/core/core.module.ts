import { Module } from '@nestjs/common';
import { CompendiumEquipmentService } from './compendium/equipment/compendium-equipment.service';
import { CompendiumEquipmentRepository } from './persistence/repositories/compendium-equipment.repository';
import { CompendiumExerciseRepository } from './persistence/repositories/compendium-exercise.repository';
import { CompendiumExerciseGroupRepository } from './persistence/repositories/compendium-exercise-group.repository';
import { CompendiumExerciseGroupMemberRepository } from './persistence/repositories/compendium-exercise-group-member.repository';
import { CompendiumExerciseRelationshipRepository } from './persistence/repositories/compendium-exercise-relationship.repository';
import { CompendiumExerciseVideoRepository } from './persistence/repositories/compendium-exercise-video.repository';
import { provideDatabase } from './persistence/database';

@Module({
  providers: [
    provideDatabase(),
    CompendiumEquipmentService,
    CompendiumEquipmentRepository,
    CompendiumExerciseRepository,
    CompendiumExerciseGroupRepository,
    CompendiumExerciseGroupMemberRepository,
    CompendiumExerciseRelationshipRepository,
    CompendiumExerciseVideoRepository,
  ],
  exports: [CompendiumEquipmentService],
})
export class CoreModule {}
