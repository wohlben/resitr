import { Component, input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { InputLabelComponent } from './input-label.component';
import { InputHintComponent } from './input-hint.component';
import { InputErrorComponent } from './input-error.component';

export interface DropdownOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputLabelComponent, InputHintComponent, InputErrorComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropdownComponent),
      multi: true,
    },
  ],
  template: `
    <div class="flex flex-col gap-1">
      @if (label()) {
        <app-input-label [text]="label()!" [required]="required()" [class]="labelClass()" />
      }
      <select
        [value]="value"
        (change)="onSelectChange($event)"
        (blur)="onTouched()"
        [disabled]="disabled"
        [attr.aria-label]="label() || placeholder()"
        [attr.aria-required]="required()"
        [attr.aria-invalid]="!!error()"
        [attr.aria-describedby]="getAriaDescribedBy()"
        class="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
        [class.border-gray-300]="!error()"
        [class.border-red-500]="error()"
      >
        @if (placeholder()) {
          <option value="">{{ placeholder() }}</option>
        }
        @for (option of options(); track option.value) {
          <option [value]="option.value">{{ option.label }}</option>
        }
      </select>
      <app-input-hint [text]="hint()" [id]="'hint-' + (label() || 'field')" />
      <app-input-error [text]="error()" [id]="'error-' + (label() || 'field')" />
    </div>
  `,
})
export class DropdownComponent implements ControlValueAccessor {
  label = input<string>();
  labelClass = input<string>('text-sm font-medium text-gray-700');
  placeholder = input<string>('Select an option');
  options = input.required<DropdownOption[]>();
  required = input<boolean>(false);
  error = input<string>('');
  hint = input<string>('');

  value = '';
  disabled = false;

  getAriaDescribedBy(): string | null {
    const parts: string[] = [];
    const id = this.label() || 'field';
    if (this.hint()) parts.push('hint-' + id);
    if (this.error()) parts.push('error-' + id);
    return parts.length > 0 ? parts.join(' ') : null;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onChange: (value: string) => void = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onTouched: () => void = () => {};

  onSelectChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.value = select.value;
    this.onChange(this.value);
  }

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
