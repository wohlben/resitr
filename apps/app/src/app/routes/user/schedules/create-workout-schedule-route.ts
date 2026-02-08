import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CreateWorkoutScheduleComponent } from './new';
import { UserWorkoutsStore, type EnrichedUserWorkout } from '../../../features/user-workouts/user-workouts.store';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-create-workout-schedule-route',
  standalone: true,
  imports: [CommonModule, CreateWorkoutScheduleComponent],
  template: ` <app-create-workout-schedule [workout]="workout()"></app-create-workout-schedule> `,
})
export class CreateWorkoutScheduleRouteComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly userWorkoutsStore = inject(UserWorkoutsStore);

  // Resolve workout from route params and store
  workout = toSignal(
    this.route.params.pipe(
      map((params) => {
        const workoutId = params['id'];
        if (!workoutId) return null;
        return this.userWorkoutsStore.enrichedWorkouts().find((uw) => uw.id === workoutId) ?? null;
      })
    ),
    { initialValue: null as EnrichedUserWorkout | null }
  );
}
