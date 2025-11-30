import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-checkbox',
  standalone: true,
  template: `
    <label class="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded" [class.opacity-50]="disabled()" [class.cursor-not-allowed]="disabled()">
      <input
        type="checkbox"
        [checked]="checked()"
        (change)="onCheckChange($event)"
        [disabled]="disabled()"
        [attr.aria-label]="ariaLabel()"
        class="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed"
      />
      <div class="flex-1">
        <div class="text-sm text-gray-900">{{ label() }}</div>
        @if (description()) {
          <div class="text-xs text-gray-500">{{ description() }}</div>
        }
      </div>
    </label>
  `,
})
export class CheckboxComponent {
  label = input.required<string>();
  description = input<string>('');
  checked = input<boolean>(false);
  disabled = input<boolean>(false);
  ariaLabel = input<string>('');

  checkedChange = output<boolean>();

  onCheckChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.checkedChange.emit(checkbox.checked);
  }
}
