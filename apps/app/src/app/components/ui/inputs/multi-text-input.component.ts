import { Component, input, forwardRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '../buttons/button.component';
import { InputLabelComponent } from './input-label.component';
import { InputHintComponent } from './input-hint.component';
import { InputErrorComponent } from './input-error.component';

@Component({
  selector: 'app-multi-text-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, InputLabelComponent, InputHintComponent, InputErrorComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiTextInputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="flex flex-col gap-2">
      @if (label()) {
        <app-input-label [text]="label()" [required]="required()" />
      }

      <div class="space-y-2" role="list" [attr.aria-label]="(label() || 'Input') + ' items'">
        @for (item of items(); track $index) {
          <div class="flex gap-2" role="listitem">
            <input
              type="text"
              [value]="item"
              (input)="updateItem($index, $event)"
              (blur)="onBlur($index)"
              [placeholder]="placeholder() || 'Enter value'"
              [disabled]="disabled"
              [attr.aria-label]="(label() || 'Input') + ' item ' + ($index + 1)"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <app-button
              [variant]="'danger-outline'"
              [disabled]="disabled"
              [attr.aria-label]="'Remove ' + (label() || 'Input') + ' item ' + ($index + 1)"
              (click)="removeItem($index)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </app-button>
          </div>
        }

        @if (items().length === 0) {
          <div class="text-sm text-gray-500 italic">No items added yet</div>
        }
      </div>

      <app-button
        [variant]="'outline-primary'"
        [disabled]="disabled"
        [attr.aria-label]="'Add new ' + (label() || 'Input') + ' item'"
        (click)="addItem()"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add {{ label() || 'Item' }}
      </app-button>

      <app-input-hint [text]="hint()" />
      <app-input-error [text]="error()" />
    </div>
  `,
})
export class MultiTextInputComponent implements ControlValueAccessor {
  label = input<string>('');
  placeholder = input<string>('');
  required = input<boolean>(false);
  error = input<string>('');
  hint = input<string>('');

  items = signal<string[]>([]);
  disabled = false;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onChange: (value: string[]) => void = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onTouched: () => void = () => {};

  addItem(): void {
    this.items.update((items) => [...items, '']);
    this.onChange(this.items());
    this.onTouched();
  }

  removeItem(index: number): void {
    this.items.update((items) => items.filter((_, i) => i !== index));
    this.onChange(this.items());
    this.onTouched();
  }

  updateItem(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    this.items.update((items) =>
      items.map((item, i) => (i === index ? input.value : item))
    );
    this.onChange(this.items());
  }

  onBlur(index: number): void {
    // Always mark as touched first
    this.onTouched();
    // Auto-remove empty items on blur to keep the list clean
    const currentItems = this.items();
    if (currentItems[index] === '') {
      this.removeItem(index);
    }
  }

  writeValue(value: string[]): void {
    this.items.set(value || []);
  }

  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
