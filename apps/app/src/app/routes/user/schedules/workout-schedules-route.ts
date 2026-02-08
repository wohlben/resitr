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
    if (!this.workoutId) return null;
    return this.userWorkoutsStore.enrichedWorkouts().find((uw) => uw.id === this.workoutId) ?? null;
  });

  backLink(): string {
    return this.workoutId ? `/user/workouts/${this.workoutId}` : '/user/workouts';
  }
}
