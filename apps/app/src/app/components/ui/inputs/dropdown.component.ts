import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DropdownOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-2">
      @if (label()) {
        <label [class]="labelClass()">{{ label() }}:</label>
      }
      <select
        [value]="value()"
        (change)="valueChange.emit($any($event.target).value)"
        class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
      >
        @if (placeholder()) {
          <option value="">{{ placeholder() }}</option>
        }
        @for (option of options(); track option.value) {
          <option [value]="option.value">{{ option.label }}</option>
        }
      </select>
    </div>
  `,
})
export class DropdownComponent {
  label = input<string>();
  labelClass = input<string>('text-sm font-medium text-gray-700');
  placeholder = input<string>('All');
  options = input.required<DropdownOption[]>();
  value = input<string>('');
  valueChange = output<string>();
}
