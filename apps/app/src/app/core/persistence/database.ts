import { Injectable } from '@angular/core';
import Dexie, { EntityTable } from 'dexie';
import { Setting } from '../schemas/setting.schema';
import { Equipment } from '../schemas/equipment.schema';
import { Exercise } from '../schemas/exercise.schema';
import { ExerciseScheme } from '../schemas/exercise-scheme.schema';
import { Workout } from '../schemas/workout.schema';
import { WorkoutLog } from '../schemas/workout-log.schema';

@Injectable({
  providedIn: 'root',
})
export class Database extends Dexie {
  settings!: EntityTable<Setting, 'id'>;
  equipment!: EntityTable<Equipment, 'id'>;
  exercises!: EntityTable<Exercise, 'id'>;
  exerciseSchemes!: EntityTable<ExerciseScheme, 'id'>; // Now supports union types with _measurementType discriminator
  workouts!: EntityTable<Workout, 'id'>;
  workoutLogs!: EntityTable<WorkoutLog, 'id'>;

  constructor() {
    super('ResiTr');

    this.version(1).stores({
      settings: 'id',
      equipment: 'id, name, *substitutesFor',
      exercises:
        'id, name, templateId, type, technicalDifficulty, *equipmentIds, *primaryMuscles, *alternativeNames, createdAt',
      exerciseSchemes: 'id, exerciseId, type',
      workouts: 'id, createdAt, updatedAt',
      workoutLogs: 'id, workoutId, start, status',
    });

  }

}
