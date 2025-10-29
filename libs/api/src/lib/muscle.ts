export enum Muscle {
  // Upper body - Chest
  CHEST = 'CHEST',

  // Upper body - Back
  LATS = 'LATS',
  TRAPS = 'TRAPS',
  RHOMBOIDS = 'RHOMBOIDS',
  LOWER_BACK = 'LOWER_BACK',

  // Upper body - Shoulders
  FRONT_DELTS = 'FRONT_DELTS',
  SIDE_DELTS = 'SIDE_DELTS',
  REAR_DELTS = 'REAR_DELTS',

  // Upper body - Arms
  BICEPS = 'BICEPS',
  TRICEPS = 'TRICEPS',
  FOREARMS = 'FOREARMS',

  // Core
  ABS = 'ABS',
  OBLIQUES = 'OBLIQUES',

  // Lower body
  GLUTES = 'GLUTES',
  QUADS = 'QUADS',
  HAMSTRINGS = 'HAMSTRINGS',
  CALVES = 'CALVES',
  HIP_FLEXORS = 'HIP_FLEXORS',
  ADDUCTORS = 'ADDUCTORS',

  // Other
  SERRATUS = 'SERRATUS',
  NECK = 'NECK',
}

export const MuscleDescriptions = {
  // Upper body - Chest
  CHEST: 'Pectoralis major and minor muscles of the upper torso',

  // Upper body - Back
  LATS: 'Latissimus dorsi - the large V-shaped muscles of the back',
  TRAPS: 'Trapezius muscles in the upper back and neck region',
  RHOMBOIDS: 'Rhomboid major and minor between the shoulder blades',
  LOWER_BACK: 'Erector spinae and lower back stabilizers',

  // Upper body - Shoulders
  FRONT_DELTS: 'Anterior deltoids at the front of the shoulders',
  SIDE_DELTS: 'Lateral deltoids at the sides of the shoulders',
  REAR_DELTS: 'Posterior deltoids at the back of the shoulders',

  // Upper body - Arms
  BICEPS: 'Biceps brachii on the front of the upper arm',
  TRICEPS: 'Triceps brachii on the back of the upper arm',
  FOREARMS: 'Flexors and extensors of the lower arm',

  // Core
  ABS: 'Rectus abdominis - the six-pack muscles',
  OBLIQUES: 'Internal and external obliques on the sides of the torso',

  // Lower body
  GLUTES: 'Gluteus maximus, medius, and minimus muscles of the buttocks',
  QUADS: 'Quadriceps femoris on the front of the thigh',
  HAMSTRINGS:
    'Biceps femoris, semitendinosus, and semimembranosus on the back of the thigh',
  CALVES: 'Gastrocnemius and soleus muscles of the lower leg',
  HIP_FLEXORS: 'Iliopsoas and other muscles that flex the hip',
  ADDUCTORS: 'Inner thigh muscles that bring the legs together',

  // Other
  SERRATUS: 'Serratus anterior muscles on the sides of the ribs',
  NECK: 'Sternocleidomastoid and other neck muscles',
} as const satisfies Record<Muscle, string>;

export const MuscleLabels = {
  // Upper body - Chest
  CHEST: 'Chest',

  // Upper body - Back
  LATS: 'Lats',
  TRAPS: 'Traps',
  RHOMBOIDS: 'Rhomboids',
  LOWER_BACK: 'Lower Back',

  // Upper body - Shoulders
  FRONT_DELTS: 'Front Delts',
  SIDE_DELTS: 'Side Delts',
  REAR_DELTS: 'Rear Delts',

  // Upper body - Arms
  BICEPS: 'Biceps',
  TRICEPS: 'Triceps',
  FOREARMS: 'Forearms',

  // Core
  ABS: 'Abs',
  OBLIQUES: 'Obliques',

  // Lower body
  GLUTES: 'Glutes',
  QUADS: 'Quads',
  HAMSTRINGS: 'Hamstrings',
  CALVES: 'Calves',
  HIP_FLEXORS: 'Hip Flexors',
  ADDUCTORS: 'Adductors',

  // Other
  SERRATUS: 'Serratus',
  NECK: 'Neck',
} as const satisfies Record<Muscle, string>;

export type MuscleKey = keyof typeof Muscle;

export const MUSCLE_GROUPS = {
  UPPER_BODY_PUSH: [
    Muscle.CHEST,
    Muscle.FRONT_DELTS,
    Muscle.TRICEPS,
  ] as const satisfies readonly Muscle[],
  UPPER_BODY_PULL: [
    Muscle.LATS,
    Muscle.TRAPS,
    Muscle.RHOMBOIDS,
    Muscle.REAR_DELTS,
    Muscle.BICEPS,
  ] as const satisfies readonly Muscle[],
  LEGS: [
    Muscle.QUADS,
    Muscle.HAMSTRINGS,
    Muscle.GLUTES,
    Muscle.CALVES,
  ] as const satisfies readonly Muscle[],
  CORE: [Muscle.ABS, Muscle.OBLIQUES] as const satisfies readonly Muscle[],
  SHOULDERS: [
    Muscle.FRONT_DELTS,
    Muscle.SIDE_DELTS,
    Muscle.REAR_DELTS,
  ] as const satisfies readonly Muscle[],
  BACK: [
    Muscle.LATS,
    Muscle.TRAPS,
    Muscle.RHOMBOIDS,
    Muscle.LOWER_BACK,
  ] as const satisfies readonly Muscle[],
  ARMS: [
    Muscle.BICEPS,
    Muscle.TRICEPS,
    Muscle.FOREARMS,
  ] as const satisfies readonly Muscle[],
  UPPER_BODY: [
    Muscle.CHEST,
    Muscle.LATS,
    Muscle.TRAPS,
    Muscle.FRONT_DELTS,
    Muscle.SIDE_DELTS,
    Muscle.REAR_DELTS,
    Muscle.BICEPS,
    Muscle.TRICEPS,
  ] as const satisfies readonly Muscle[],
  LOWER_BODY: [
    Muscle.QUADS,
    Muscle.HAMSTRINGS,
    Muscle.GLUTES,
    Muscle.CALVES,
    Muscle.HIP_FLEXORS,
    Muscle.ADDUCTORS,
  ] as const satisfies readonly Muscle[],
} as const;
