import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SchedulesListComponent } from './index';
import { UserWorkoutsStore, type EnrichedUserWorkout } from '../../../features/user-workouts/user-workouts.store';

@Component({
  selector: 'app-workout-schedules-route',
  standalone: true,
  imports: [CommonModule, SchedulesListComponent],
  template: ` <app-schedules-list [workout]="workout()" [backLink]="backLink()"> </app-schedules-list> `,
})
export class WorkoutSchedulesRouteComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly userWorkoutsStore = inject(UserWorkoutsStore);

  // Get workoutId from route once (doesn't change)
  private readonly workoutId = this.route.snapshot.paramMap.get('id');

  // Computed signal that reacts to store changes
  workout = computed(() => {
    const workoutId = this.workoutId;
    console.log('[WorkoutSchedulesRoute] Computing workout, id:', workoutId);
    console.log('[WorkoutSchedulesRoute] Store enrichedWorkouts:', this.userWorkoutsStore.enrichedWorkouts());
    if (!workoutId) return null;
    const found = this.userWorkoutsStore.enrichedWorkouts().find((uw) => uw.id === workoutId);
    console.log('[WorkoutSchedulesRoute] Found workout:', found);
    return found ?? null;
  });

  constructor() {
    console.log('[WorkoutSchedulesRoute] Component created');
    console.log('[WorkoutSchedulesRoute] Current route snapshot:', this.route.snapshot.url);
  }

  backLink(): string {
    return this.workoutId ? `/user/workouts/${this.workoutId}` : '/user/workouts';
  }
}
