import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CreateWorkoutScheduleComponent } from './new';
import { UserWorkoutsStore } from '../../../features/user-workouts/user-workouts.store';

@Component({
  selector: 'app-create-workout-schedule-route',
  standalone: true,
  imports: [CommonModule, CreateWorkoutScheduleComponent],
  template: ` <app-create-workout-schedule [workout]="workout()"></app-create-workout-schedule> `,
})
export class CreateWorkoutScheduleRouteComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly userWorkoutsStore = inject(UserWorkoutsStore);

  // Get workoutId from route once (doesn't change)
  private readonly workoutId = this.route.snapshot.paramMap.get('id');

  // Computed signal that reacts to store changes
  workout = computed(() => {
    const workoutId = this.workoutId;
    console.log('[CreateWorkoutScheduleRoute] Computing workout, id:', workoutId);
    console.log('[CreateWorkoutScheduleRoute] Store enrichedWorkouts:', this.userWorkoutsStore.enrichedWorkouts());
    if (!workoutId) return null;
    const found = this.userWorkoutsStore.enrichedWorkouts().find((uw) => uw.id === workoutId);
    console.log('[CreateWorkoutScheduleRoute] Found workout:', found);
    return found ?? null;
  });

  constructor() {
    console.log('[CreateWorkoutScheduleRoute] Component created');
    console.log('[CreateWorkoutScheduleRoute] Current route snapshot:', this.route.snapshot.url);
  }
}
