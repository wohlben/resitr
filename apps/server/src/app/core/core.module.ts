import { Module } from '@nestjs/common';
import { CompendiumEquipmentService } from './compendium/equipment/compendium-equipment.service';
import { CompendiumEquipmentRepository } from './persistence/repositories/compendium-equipment.repository';
import { CompendiumExerciseRepository } from './persistence/repositories/compendium-exercise.repository';
import { CompendiumExerciseGroupRepository } from './persistence/repositories/compendium-exercise-group.repository';
import { CompendiumExerciseGroupMemberRepository } from './persistence/repositories/compendium-exercise-group-member.repository';
import { CompendiumExerciseRelationshipRepository } from './persistence/repositories/compendium-exercise-relationship.repository';
import { CompendiumExerciseVideoRepository } from './persistence/repositories/compendium-exercise-video.repository';
import { provideDatabase } from './persistence/database';
import { CompendiumExerciseService } from './compendium/exercise/compendium-exercise.service';
import { CompendiumExerciseRelationshipService } from './compendium/exercise-relationship/compendium-exercise-relationship.service';
import { CompendiumExerciseGroupService } from './compendium/exercise-group/compendium-exercise-group.service';
import { CompendiumExerciseGroupMemberService } from './compendium/exercise-group-member/compendium-exercise-group-member.service';
import { CompendiumExerciseVideoService } from './compendium/exercise-video/compendium-exercise-video.service';

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
    CompendiumExerciseService,
    CompendiumExerciseRelationshipService,
    CompendiumExerciseGroupService,
    CompendiumExerciseGroupMemberService,
    CompendiumExerciseVideoService,
  ],
  exports: [
    CompendiumEquipmentService,
    CompendiumExerciseService,
    CompendiumExerciseRelationshipService,
    CompendiumExerciseGroupService,
    CompendiumExerciseGroupMemberService,
    CompendiumExerciseVideoService,
  ],
})
export class CoreModule {}
