import { Component, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '../button.component';
import { CheckboxComponent } from './checkbox.component';
import { InputLabelComponent } from './input-label.component';
import { InputHintComponent } from './input-hint.component';
import { InputErrorComponent } from './input-error.component';

export interface MultiSelectOption {
  value: string;
  label: string;
  description?: string;
}

@Component({
  selector: 'app-multi-select',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent, CheckboxComponent, InputLabelComponent, InputHintComponent, InputErrorComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiSelectComponent),
      multi: true,
    },
  ],
  template: `
    <div class="flex flex-col gap-2">
      @if (label()) {
        <app-input-label [text]="label()" [required]="required()" />
      }

      @if (options().length > 5 && showSearch()) {
        <input
          type="text"
          [value]="searchTerm()"
          (input)="onSearchInput($event)"
          placeholder="Search..."
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
        />
      }

      <div class="flex gap-2 mb-2">
        <app-button
          [variant]="'outline-primary'"
          [size]="'sm'"
          [disabled]="disabled"
          (click)="selectAll()"
        >
          Select All
        </app-button>
        <app-button
          [variant]="'outline-secondary'"
          [size]="'sm'"
          [disabled]="disabled"
          (click)="clearAll()"
        >
          Clear All
        </app-button>
      </div>

      <div class="border border-gray-300 rounded-lg p-3 max-h-60 overflow-y-auto space-y-0" role="group" [attr.aria-label]="(label() || 'Selection') + ' options'">
        @for (option of filteredOptions(); track option.value) {
          <app-checkbox
            [label]="option.label"
            [description]="option.description || ''"
            [checked]="isSelected(option.value)"
            [disabled]="disabled"
            [ariaLabel]="option.label + (option.description ? ': ' + option.description : '')"
            (checkedChange)="toggleOption(option.value)"
          />
        } @empty {
          <div class="text-sm text-gray-500 text-center py-4">No options found</div>
        }
      </div>

      <app-input-hint [text]="hint()" />
      <app-input-error [text]="error()" />
    </div>
  `,
})
export class MultiSelectComponent implements ControlValueAccessor {
  label = input<string>('');
  options = input.required<MultiSelectOption[]>();
  required = input<boolean>(false);
  showSearch = input<boolean>(true);
  error = input<string>('');
  hint = input<string>('');

  selectedValues = signal<string[]>([]);
  searchTerm = signal('');
  disabled = false;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onChange: (value: string[]) => void = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onTouched: () => void = () => {};

  filteredOptions = computed(() => {
    const search = this.searchTerm().toLowerCase();
    return this.options().filter(
      (opt) =>
        !search ||
        opt.label.toLowerCase().includes(search) ||
        opt.value.toLowerCase().includes(search) ||
        opt.description?.toLowerCase().includes(search)
    );
  });

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  isSelected(value: string): boolean {
    return this.selectedValues().includes(value);
  }

  toggleOption(value: string): void {
    const current = this.selectedValues();
    const newValues = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];

    this.selectedValues.set(newValues);
    this.onChange(newValues);
    this.onTouched();
  }

  selectAll(): void {
    const allValues = this.filteredOptions().map((opt) => opt.value);
    this.selectedValues.set(allValues);
    this.onChange(allValues);
    this.onTouched();
  }

  clearAll(): void {
    this.selectedValues.set([]);
    this.onChange([]);
    this.onTouched();
  }

  writeValue(value: string[]): void {
    this.selectedValues.set(value || []);
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
