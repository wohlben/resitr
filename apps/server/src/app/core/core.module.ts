import { Module } from '@nestjs/common';
import { CompendiumEquipmentService } from './compendium/equipment/compendium-equipment.service';
import { CompendiumEquipmentRepository } from './persistence/repositories/compendium-equipment.repository';
import { CompendiumExerciseRepository } from './persistence/repositories/compendium-exercise.repository';
import { CompendiumExerciseGroupRepository } from './persistence/repositories/compendium-exercise-group.repository';
import { CompendiumExerciseGroupMemberRepository } from './persistence/repositories/compendium-exercise-group-member.repository';
import { CompendiumExerciseRelationshipRepository } from './persistence/repositories/compendium-exercise-relationship.repository';
import { CompendiumExerciseSchemeRepository } from './persistence/repositories/compendium-exercise-scheme.repository';
import { CompendiumExerciseVideoRepository } from './persistence/repositories/compendium-exercise-video.repository';
import { CompendiumWorkoutRepository } from './persistence/repositories/compendium-workout.repository';
import { CompendiumWorkoutSectionRepository } from './persistence/repositories/compendium-workout-section.repository';
import { CompendiumWorkoutSectionItemRepository } from './persistence/repositories/compendium-workout-section-item.repository';
import { CompendiumWorkoutScheduleRepository } from './persistence/repositories/compendium-workout-schedule.repository';
import { provideDatabase } from './persistence/database';
import { CompendiumExerciseService } from './compendium/exercise/compendium-exercise.service';
import { CompendiumExerciseRelationshipService } from './compendium/exercise-relationship/compendium-exercise-relationship.service';
import { CompendiumExerciseGroupService } from './compendium/exercise-group/compendium-exercise-group.service';
import { CompendiumExerciseGroupMemberService } from './compendium/exercise-group-member/compendium-exercise-group-member.service';
import { CompendiumExerciseSchemeService } from './compendium/exercise-scheme/compendium-exercise-scheme.service';
import { CompendiumExerciseVideoService } from './compendium/exercise-video/compendium-exercise-video.service';
import { CompendiumWorkoutService } from './compendium/workout/compendium-workout.service';

@Module({
  providers: [
    provideDatabase(),
    CompendiumEquipmentService,
    CompendiumEquipmentRepository,
    CompendiumExerciseRepository,
    CompendiumExerciseGroupRepository,
    CompendiumExerciseGroupMemberRepository,
    CompendiumExerciseRelationshipRepository,
    CompendiumExerciseSchemeRepository,
    CompendiumExerciseVideoRepository,
    CompendiumWorkoutRepository,
    CompendiumWorkoutSectionRepository,
    CompendiumWorkoutSectionItemRepository,
    CompendiumWorkoutScheduleRepository,
    CompendiumExerciseService,
    CompendiumExerciseRelationshipService,
    CompendiumExerciseGroupService,
    CompendiumExerciseGroupMemberService,
    CompendiumExerciseSchemeService,
    CompendiumExerciseVideoService,
    CompendiumWorkoutService,
  ],
  exports: [
    CompendiumEquipmentService,
    CompendiumExerciseService,
    CompendiumExerciseRelationshipService,
    CompendiumExerciseGroupService,
    CompendiumExerciseGroupMemberService,
    CompendiumExerciseSchemeService,
    CompendiumExerciseVideoService,
    CompendiumWorkoutService,
  ],
})
export class CoreModule {}
