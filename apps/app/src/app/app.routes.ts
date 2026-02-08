import { Route } from '@angular/router';
import { unsavedChangesGuard } from './core/guards/unsaved-changes.guard';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: 'compendium/equipments',
        loadComponent: () =>
          import('./routes/compendium/equipments').then((m) => m.EquipmentsComponent),
      },
      {
        path: 'compendium/equipments/new',
        loadComponent: () =>
          import('./routes/compendium/equipment-new').then((m) => m.EquipmentNew),
        canDeactivate: [unsavedChangesGuard],
      },
      {
        path: 'compendium/equipments/:id',
        loadComponent: () =>
          import('./routes/compendium/equipment-detail').then((m) => m.EquipmentDetail),
      },
      {
        path: 'compendium/equipments/:id/edit',
        loadComponent: () =>
          import('./routes/compendium/equipment-edit').then((m) => m.EquipmentEdit),
        canDeactivate: [unsavedChangesGuard],
      },
      {
        path: 'compendium/exercises',
        loadComponent: () =>
          import('./routes/compendium/exercises').then((m) => m.ExercisesComponent),
      },
      {
        path: 'compendium/exercises/new',
        loadComponent: () =>
          import('./routes/compendium/exercise-new').then((m) => m.ExerciseNew),
        canDeactivate: [unsavedChangesGuard],
      },
      {
        path: 'compendium/exercises/:id',
        loadComponent: () =>
          import('./routes/compendium/exercise-detail').then((m) => m.ExerciseDetail),
      },
      {
        path: 'compendium/exercises/:id/edit',
        loadComponent: () =>
          import('./routes/compendium/exercise-edit').then((m) => m.ExerciseEdit),
        canDeactivate: [unsavedChangesGuard],
      },
      {
        path: 'compendium/exercise-groups',
        loadComponent: () =>
          import('./routes/compendium/exercise-groups').then((m) => m.ExerciseGroupsComponent),
      },
      {
        path: 'compendium/exercise-groups/new',
        loadComponent: () =>
          import('./routes/compendium/exercise-group-new').then((m) => m.ExerciseGroupNew),
        canDeactivate: [unsavedChangesGuard],
      },
      {
        path: 'compendium/exercise-groups/:id',
        loadComponent: () =>
          import('./routes/compendium/exercise-group-detail').then(
            (m) => m.ExerciseGroupDetail
          ),
      },
      {
        path: 'compendium/exercise-groups/:id/edit',
        loadComponent: () =>
          import('./routes/compendium/exercise-group-edit').then((m) => m.ExerciseGroupEdit),
        canDeactivate: [unsavedChangesGuard],
      },
      {
        path: 'compendium/workouts',
        loadComponent: () =>
          import('./routes/compendium/workouts').then((m) => m.WorkoutsComponent),
      },
      {
        path: 'compendium/workouts/new',
        loadComponent: () =>
          import('./routes/compendium/workout-new').then((m) => m.WorkoutNew),
        canDeactivate: [unsavedChangesGuard],
      },
      {
        path: 'compendium/workouts/:id',
        loadComponent: () =>
          import('./routes/compendium/workout-detail').then((m) => m.WorkoutDetail),
      },
      {
        path: 'compendium/workouts/:id/versions',
        loadComponent: () =>
          import('./routes/compendium/workout-versions').then((m) => m.WorkoutVersions),
      },
      {
        path: 'compendium/workouts/:id/edit',
        loadComponent: () =>
          import('./routes/compendium/workout-edit').then((m) => m.WorkoutEdit),
        canDeactivate: [unsavedChangesGuard],
      },
      {
        path: 'user/workouts',
        loadComponent: () =>
          import('./routes/user/workouts').then((m) => m.UserWorkoutsComponent),
      },
      {
        path: 'user/workouts/:id',
        loadComponent: () =>
          import('./routes/user/workout-detail').then((m) => m.UserWorkoutDetail),
      },
      {
        path: 'user/workouts/:id/edit',
        loadComponent: () =>
          import('./routes/user/workout-edit').then((m) => m.UserWorkoutEdit),
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
    ]
  }
];
