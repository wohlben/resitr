import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ButtonGroupOption {
  value: string;
  label: string;
  icon?: string;
  activeClass?: string;
}

@Component({
  selector: 'app-button-group',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inline-flex w-fit rounded-lg border border-gray-300 overflow-hidden" role="group">
      @for (option of options(); track option.value) {
        <button
          type="button"
          (click)="onSelect(option.value)"
          class="px-3 py-1.5 text-sm font-medium transition-colors border-r last:border-r-0 border-gray-300"
          [ngClass]="getButtonClass(option)"
          [attr.aria-pressed]="value() === option.value"
        >
          @if (option.icon) {
            <span>{{ option.icon }}</span>
          }
          {{ option.label }}
        </button>
      }
    </div>
  `,
})
export class ButtonGroupComponent {
  options = input.required<ButtonGroupOption[]>();
  value = input<string>('');

  valueChange = output<string>();

  onSelect(value: string): void {
    this.valueChange.emit(value);
  }

  getButtonClass(option: ButtonGroupOption): string {
    if (this.value() === option.value) {
      return option.activeClass || 'bg-blue-500 text-white';
    }
    return 'bg-white text-gray-700 hover:bg-gray-50';
  }
}
