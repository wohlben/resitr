import { Component, input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { InputLabelComponent } from './input-label.component';
import { InputHintComponent } from './input-hint.component';
import { InputErrorComponent } from './input-error.component';

@Component({
  selector: 'app-textarea-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputLabelComponent, InputHintComponent, InputErrorComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaInputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="flex flex-col gap-1">
      @if (label()) {
        <app-input-label [text]="label()" [required]="required()" />
      }
      <textarea
        [value]="value"
        (input)="onInput($event)"
        (blur)="onTouched()"
        [placeholder]="placeholder()"
        [readonly]="readonly()"
        [disabled]="disabled"
        [rows]="rows()"
        [attr.aria-label]="label() || placeholder()"
        [attr.aria-required]="required()"
        [attr.aria-invalid]="!!error()"
        [attr.aria-describedby]="getAriaDescribedBy()"
        class="px-3 py-2 border rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed read-only:bg-gray-50 resize-y"
        [class.border-gray-300]="!error()"
        [class.border-red-500]="error()"
      ></textarea>
      <app-input-hint [text]="hint()" [id]="'hint-' + label()" />
      <app-input-error [text]="error()" [id]="'error-' + label()" />
    </div>
  `,
})
export class TextareaInputComponent implements ControlValueAccessor {
  label = input<string>('');
  placeholder = input<string>('');
  readonly = input<boolean>(false);
  required = input<boolean>(false);
  rows = input<number>(3);
  error = input<string>('');
  hint = input<string>('');

  value = '';
  disabled = false;

  getAriaDescribedBy(): string | null {
    const parts: string[] = [];
    if (this.hint()) parts.push('hint-' + this.label());
    if (this.error()) parts.push('error-' + this.label());
    return parts.length > 0 ? parts.join(' ') : null;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onChange: (value: string) => void = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onTouched: () => void = () => {};

  onInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.value = textarea.value;
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
