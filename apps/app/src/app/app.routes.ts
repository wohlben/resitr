import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'compendium/equipments',
    loadComponent: () =>
      import('./routes/compendium/equipments').then((m) => m.EquipmentsComponent),
  },
  {
    path: 'compendium/equipments/:id',
    loadComponent: () =>
      import('./routes/compendium/equipment-detail').then((m) => m.EquipmentDetail),
  },
  {
    path: 'compendium/exercises',
    loadComponent: () =>
      import('./routes/compendium/exercises').then((m) => m.ExercisesComponent),
  },
  {
    path: 'compendium/exercises/:id',
    loadComponent: () =>
      import('./routes/compendium/exercise-detail').then((m) => m.ExerciseDetail),
  },
  {
    path: 'compendium/exercise-groups',
    loadComponent: () =>
      import('./routes/compendium/exercise-groups').then((m) => m.ExerciseGroupsComponent),
  },
  {
    path: 'compendium/exercise-groups/:id',
    loadComponent: () =>
      import('./routes/compendium/exercise-group-detail').then(
        (m) => m.ExerciseGroupDetail
      ),
  },
  {
    path: 'compendium/workouts',
    loadComponent: () =>
      import('./routes/compendium/workouts').then((m) => m.WorkoutsComponent),
  },
  {
    path: 'compendium/workouts/:id',
    loadComponent: () =>
      import('./routes/compendium/workout-detail').then((m) => m.WorkoutDetail),
  },
  {
    path: 'user/workout-logs',
    loadComponent: () =>
      import('./routes/user/workout-logs').then((m) => m.WorkoutLogsComponent),
  },
  {
    path: 'user/workout-logs/:id',
    loadComponent: () =>
      import('./routes/user/workout-log-detail').then((m) => m.WorkoutLogDetail),
  },
  {
    path: 'user/workout-schedule',
    loadComponent: () =>
      import('./routes/user/workout-schedule').then((m) => m.WorkoutScheduleComponent),
  },
  {
    path: 'user/workout-schedule/:id',
    loadComponent: () =>
      import('./routes/user/workout-schedule-detail').then(
        (m) => m.WorkoutScheduleDetail
      ),
  },
];
