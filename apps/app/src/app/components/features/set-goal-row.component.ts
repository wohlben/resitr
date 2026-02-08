import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NumberInputComponent } from '../ui/inputs/number-input.component';

export interface SetTarget {
  targetReps?: number | undefined;
  targetWeight?: number | undefined;
  targetTime?: number | undefined;
  targetDistance?: number | undefined;
}

@Component({
  selector: 'app-set-goal-row',
  standalone: true,
  imports: [FormsModule, NumberInputComponent],
  template: `
    <div class="flex items-center gap-2 py-2">
      <span class="text-sm font-medium text-gray-500 w-12">Set {{ setNumber() }}</span>
      <div class="flex-1 grid grid-cols-4 gap-2">
        <app-number-input
          [(ngModel)]="target().targetReps"
          (ngModelChange)="onTargetChange()"
          placeholder="Reps"
          [min]="0"
          class="w-full"
        />
        <app-number-input
          [(ngModel)]="target().targetWeight"
          (ngModelChange)="onTargetChange()"
          placeholder="Weight"
          [min]="0"
          [step]="0.5"
          class="w-full"
        />
        <app-number-input
          [(ngModel)]="target().targetTime"
          (ngModelChange)="onTargetChange()"
          placeholder="Time (s)"
          [min]="0"
          class="w-full"
        />
        <app-number-input
          [(ngModel)]="target().targetDistance"
          (ngModelChange)="onTargetChange()"
          placeholder="Distance"
          [min]="0"
          [step]="0.1"
          class="w-full"
        />
      </div>
    </div>
  `,
})
export class SetGoalRowComponent {
  setNumber = input.required<number>();
  target = input.required<SetTarget>();
  targetChange = output<SetTarget>();

  onTargetChange(): void {
    this.targetChange.emit(this.target());
  }
}
