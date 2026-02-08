import { Component, input, output } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { WorkoutSectionTypeLabels } from '@resitr/api';
import { CardComponent } from './card.component';
import { ValueLabelPipe } from '../../../shared/pipes/value-label.pipe';
import { ActionMenuComponent, type ActionMenuItem } from '../menus/action-menu.component';
import type { EnrichedUserWorkout } from '../../../features/user-workouts/user-workouts.store';

export type UserWorkoutAction = 'start' | 'viewLogs' | 'schedule' | 'delete';

const MENU_ITEMS: ActionMenuItem[] = [
  {
    id: 'start',
    label: 'Start Workout',
    icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    id: 'viewLogs',
    label: 'View Logs',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
  },
  {
    id: 'schedule',
    label: 'Schedule',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  },
  {
    id: 'delete',
    label: 'Remove from My Workouts',
    icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    variant: 'danger',
  },
];

@Component({
  selector: 'app-user-workout-card',
  standalone: true,
  imports: [CommonModule, CardComponent, NgClass, ValueLabelPipe, ActionMenuComponent],
  template: `
    <app-card class="cursor-pointer hover:shadow-md transition-shadow" (click)="onCardClick($event)">
      <div card-title class="flex items-start justify-between gap-2">
        <div class="min-w-0 flex-1">
          @if (userWorkout().workout) {
          <h3 class="text-lg font-semibold text-gray-900">{{ userWorkout().workout!.name }}</h3>
          @if (userWorkout().workout!.description) {
          <p class="text-sm text-gray-500 truncate">{{ userWorkout().workout!.description }}</p>
          } } @else {
          <h3 class="text-lg font-semibold text-gray-400 italic">Workout not found</h3>
          <p class="text-sm text-gray-400">Template ID: {{ userWorkout().workoutTemplateId }}</p>
          }
        </div>
        <app-action-menu [items]="menuItems" (itemSelected)="onMenuAction($event)" ariaLabel="Workout actions" />
      </div>

      @if (userWorkout().workout) {
      <span card-badge class="px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-700">
        {{ userWorkout().workout!.sections.length }} section{{
          userWorkout().workout!.sections.length !== 1 ? 's' : ''
        }}
      </span>
      } @if (userWorkout().workout) {
      <div card-content class="flex flex-wrap gap-1">
        @for (section of userWorkout().workout!.sections; track section.id) {
        <span
          class="px-2 py-0.5 text-xs font-medium rounded"
          [ngClass]="{
            'bg-orange-100 text-orange-700': section.type === 'warmup',
            'bg-blue-100 text-blue-700': section.type === 'stretching',
            'bg-red-100 text-red-700': section.type === 'strength',
            'bg-green-100 text-green-700': section.type === 'cooldown'
          }"
        >
          {{ section.type | valueLabel : WorkoutSectionTypeLabels }}
        </span>
        }
      </div>
      } @if (userWorkout().workout) {
      <ng-container card-footer-left>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <span>{{ getTotalItems() }} exercise{{ getTotalItems() !== 1 ? 's' : '' }}</span>
      </ng-container>
      } @if (userWorkout().workout) {
      <span card-footer-right class="text-xs"> v{{ userWorkout().workout!.version }} </span>
      }
    </app-card>
  `,
})
export class UserWorkoutCardComponent {
  userWorkout = input.required<EnrichedUserWorkout>();

  actionTriggered = output<UserWorkoutAction>();
  cardClicked = output<void>();

  readonly menuItems = MENU_ITEMS;
  readonly WorkoutSectionTypeLabels = WorkoutSectionTypeLabels;

  getTotalItems(): number {
    const workout = this.userWorkout().workout;
    if (!workout) return 0;
    return workout.sections.reduce((total, section) => {
      return total + section.items.length;
    }, 0);
  }

  onMenuAction(item: ActionMenuItem): void {
    this.actionTriggered.emit(item.id as UserWorkoutAction);
  }

  onCardClick(event: Event): void {
    // Don't trigger card click if clicking on the action menu
    const target = event.target as HTMLElement;
    if (target.closest('app-action-menu')) {
      return;
    }
    this.cardClicked.emit();
  }
}
