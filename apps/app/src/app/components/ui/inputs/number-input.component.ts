import { Component, input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { InputLabelComponent } from './input-label.component';
import { InputHintComponent } from './input-hint.component';
import { InputErrorComponent } from './input-error.component';

@Component({
  selector: 'app-number-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputLabelComponent, InputHintComponent, InputErrorComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NumberInputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="flex flex-col gap-1">
      @if (label()) {
        <app-input-label [text]="label()" [required]="required()" />
      }
      <input
        type="number"
        [value]="value"
        (input)="onInput($event)"
        (blur)="onBlur($event)"
        [placeholder]="placeholder()"
        [readonly]="readonly()"
        [disabled]="disabled"
        [min]="min()"
        [max]="max()"
        [step]="step()"
        [attr.aria-label]="label() || placeholder()"
        [attr.aria-required]="required()"
        [attr.aria-invalid]="!!error()"
        [attr.aria-describedby]="getAriaDescribedBy()"
        [attr.aria-valuemin]="min()"
        [attr.aria-valuemax]="max()"
        [attr.aria-valuenow]="value"
        class="px-3 py-2 border rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed read-only:bg-gray-50"
        [class.border-gray-300]="!error()"
        [class.border-red-500]="error()"
      />
      <app-input-hint [text]="hint()" [id]="'hint-' + label()" />
      <app-input-error [text]="error()" [id]="'error-' + label()" />
    </div>
  `,
})
export class NumberInputComponent implements ControlValueAccessor {
  label = input<string>('');
  placeholder = input<string>('');
  readonly = input<boolean>(false);
  required = input<boolean>(false);
  min = input<number | undefined>(undefined);
  max = input<number | undefined>(undefined);
  step = input<number | undefined>(undefined);
  error = input<string>('');
  hint = input<string>('');

  value: number | null = null;
  disabled = false;

  getAriaDescribedBy(): string | null {
    const parts: string[] = [];
    if (this.hint()) parts.push('hint-' + this.label());
    if (this.error()) parts.push('error-' + this.label());
    return parts.length > 0 ? parts.join(' ') : null;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onChange: (value: number | null) => void = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onTouched: () => void = () => {};

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value ? parseFloat(input.value) : null;
    this.onChange(this.value);
  }

  onBlur(event: Event): void {
    this.onTouched();
    // Validate min/max on blur
    const input = event.target as HTMLInputElement;
    if (this.value !== null) {
      const minVal = this.min();
      const maxVal = this.max();

      if (minVal !== undefined && this.value < minVal) {
        input.setCustomValidity(`Value must be at least ${minVal}`);
      } else if (maxVal !== undefined && this.value > maxVal) {
        input.setCustomValidity(`Value must be at most ${maxVal}`);
      } else {
        input.setCustomValidity('');
      }
      input.reportValidity();
    }
  }

  writeValue(value: number | null): void {
    this.value = value;
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
