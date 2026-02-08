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
        console.log('[WorkoutSchedulesRoute] Route param id:', workoutId);
        console.log('[WorkoutSchedulesRoute] Store enrichedWorkouts:', this.userWorkoutsStore.enrichedWorkouts());
        if (!workoutId) return null;
        const found = this.userWorkoutsStore.enrichedWorkouts().find((uw) => uw.id === workoutId);
        console.log('[WorkoutSchedulesRoute] Found workout:', found);
        return found ?? null;
      })
    ),
    { initialValue: null as EnrichedUserWorkout | null }
  );

  constructor() {
    console.log('[WorkoutSchedulesRoute] Component created');
    console.log('[WorkoutSchedulesRoute] Current route snapshot:', this.route.snapshot.url);
  }

  backLink(): string {
    const workoutId = this.route.snapshot.paramMap.get('id');
    return workoutId ? `/user/workouts/${workoutId}` : '/user/workouts';
  }
}
