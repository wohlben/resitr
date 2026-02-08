import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UserWorkoutsStore } from '../../../features/user-workouts/user-workouts.store';

@Component({
  selector: 'app-workout-schedules-route',
  standalone: true,
  imports: [CommonModule],
  template: ``,
})
export class WorkoutSchedulesRouteComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly userWorkoutsStore = inject(UserWorkoutsStore);

  // Get workoutId from route once (doesn't change)
  private readonly workoutId = this.route.snapshot.paramMap.get('id');

  // Computed signal that reacts to store changes
  workout = computed(() => {
    if (!this.workoutId) return null;
    return this.userWorkoutsStore.enrichedWorkouts().find((uw) => uw.id === this.workoutId) ?? null;
  });

  constructor() {
    // Redirect to the main Calendar page
    // In the future, we could add a workout filter to the Calendar page
    this.router.navigate(['/user/calendar']);
  }
}
