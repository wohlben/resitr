import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SchedulesListComponent } from './index';
import { UserWorkoutsStore, type EnrichedUserWorkout } from '../../../features/user-workouts/user-workouts.store';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-workout-schedules-route',
  standalone: true,
  imports: [CommonModule, SchedulesListComponent],
  template: ` <app-schedules-list [workout]="workout()" [backLink]="backLink()"> </app-schedules-list> `,
})
export class WorkoutSchedulesRouteComponent {
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

  backLink(): string {
    const workoutId = this.route.snapshot.paramMap.get('id');
    return workoutId ? `/user/workouts/${workoutId}` : '/user/workouts';
  }
}
