import { Component, input, forwardRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { InputLabelComponent } from './input-label.component';
import { InputHintComponent } from './input-hint.component';
import { InputErrorComponent } from './input-error.component';

@Component({
  selector: 'app-text-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputLabelComponent, InputHintComponent, InputErrorComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextInputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="flex flex-col gap-1">
      @if (label()) {
        <app-input-label [text]="label()" [required]="required()" />
      }
      <input
        #inputElement
        [type]="type()"
        [value]="value"
        (input)="onInput($event)"
        (blur)="onBlur()"
        [placeholder]="placeholder()"
        [readonly]="readonly()"
        [disabled]="disabled"
        [attr.aria-label]="label() || placeholder()"
        [attr.aria-required]="required()"
        [attr.aria-invalid]="!!error()"
        [attr.aria-describedby]="getAriaDescribedBy()"
        class="px-3 py-2 border rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed read-only:bg-gray-50"
        [class.border-gray-300]="!error()"
        [class.border-red-500]="error()"
      />
      <app-input-hint [text]="hint()" [id]="'hint-' + (label() || 'field')" />
      <app-input-error [text]="error()" [id]="'error-' + (label() || 'field')" />
    </div>
  `,
})
export class TextInputComponent implements ControlValueAccessor {
  label = input<string>('');
  placeholder = input<string>('');
  type = input<string>('text');
  readonly = input<boolean>(false);
  required = input<boolean>(false);
  error = input<string>('');
  hint = input<string>('');

  @ViewChild('inputElement') inputElement?: ElementRef<HTMLInputElement>;

  getAriaDescribedBy(): string | null {
    const parts: string[] = [];
    if (this.hint()) parts.push('hint-' + (this.label() || 'field'));
    if (this.error()) parts.push('error-' + (this.label() || 'field'));
    return parts.length > 0 ? parts.join(' ') : null;
  }

  value = '';
  disabled = false;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onChange: (value: string) => void = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onTouched: () => void = () => {};

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.onChange(this.value);
  }

  onBlur(): void {
    this.onTouched();
    // Validate URL on blur if type is 'url'
    if (this.type() === 'url' && this.value && !this.isValidUrl(this.value)) {
      // The browser's built-in validation will catch this, but we ensure touched state
      this.inputElement?.nativeElement?.setCustomValidity?.('Please enter a valid URL');
    }
  }

  private isValidUrl(value: string): boolean {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
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
