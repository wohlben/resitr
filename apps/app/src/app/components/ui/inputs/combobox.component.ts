import { Component, input, output, signal, computed, ElementRef, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputLabelComponent } from './input-label.component';

export interface ComboboxOption {
  value: string;
  label: string;
  sublabel?: string | undefined;
  meta?: string | undefined;
}

@Component({
  selector: 'app-combobox',
  standalone: true,
  imports: [CommonModule, InputLabelComponent],
  template: `
    <div class="flex flex-col gap-1 relative">
      @if (label()) {
        <app-input-label [text]="label()!" [required]="required()" />
      }

      <div class="relative">
        <input
          type="text"
          [placeholder]="placeholder()"
          [value]="searchTerm()"
          (input)="onInput($event)"
          (focus)="onFocus()"
          (keydown)="onKeyDown($event)"
          [disabled]="disabled()"
          class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
          [class.border-gray-300]="!isOpen()"
          [class.border-blue-500]="isOpen()"
        />

        <!-- Dropdown arrow -->
        <button
          type="button"
          (click)="toggleDropdown()"
          [disabled]="disabled()"
          class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <!-- Dropdown list -->
      @if (isOpen() && !disabled()) {
        <div class="absolute z-50 w-full mt-1 top-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          @if (filteredOptions().length === 0) {
            <div class="px-3 py-2 text-sm text-gray-500 italic">
              {{ emptyMessage() }}
            </div>
          } @else {
            @for (option of filteredOptions(); track option.value; let i = $index) {
              <button
                type="button"
                (click)="selectOption(option)"
                (mouseenter)="highlightedIndex.set(i)"
                class="w-full px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                [class.bg-blue-50]="highlightedIndex() === i"
              >
                <div class="flex items-center justify-between gap-2">
                  <div class="min-w-0 flex-1">
                    <div class="text-sm font-medium text-gray-900 truncate">{{ option.label }}</div>
                    @if (option.sublabel) {
                      <div class="text-xs text-gray-500 truncate">{{ option.sublabel }}</div>
                    }
                  </div>
                  @if (option.meta) {
                    <div class="text-xs text-gray-400 flex-shrink-0">{{ option.meta }}</div>
                  }
                </div>
              </button>
            }
          }
        </div>
      }
    </div>
  `,
  host: {
    class: 'block relative',
  },
})
export class ComboboxComponent {
  private elementRef = inject(ElementRef);

  label = input<string>();
  placeholder = input<string>('Search...');
  options = input.required<ComboboxOption[]>();
  disabled = input<boolean>(false);
  required = input<boolean>(false);
  emptyMessage = input<string>('No options found');

  optionSelected = output<ComboboxOption>();

  searchTerm = signal('');
  isOpen = signal(false);
  highlightedIndex = signal(0);

  filteredOptions = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const opts = this.options();

    if (!term) {
      return opts;
    }

    return opts.filter((option) =>
      option.label.toLowerCase().includes(term) ||
      option.sublabel?.toLowerCase().includes(term) ||
      option.meta?.toLowerCase().includes(term)
    );
  });

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.isOpen.set(true);
    this.highlightedIndex.set(0);
  }

  onFocus(): void {
    this.isOpen.set(true);
  }

  toggleDropdown(): void {
    this.isOpen.set(!this.isOpen());
  }

  onKeyDown(event: KeyboardEvent): void {
    const options = this.filteredOptions();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.isOpen.set(true);
        this.highlightedIndex.set(
          Math.min(this.highlightedIndex() + 1, options.length - 1)
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.highlightedIndex.set(Math.max(this.highlightedIndex() - 1, 0));
        break;
      case 'Enter':
        event.preventDefault();
        if (this.isOpen() && options.length > 0) {
          this.selectOption(options[this.highlightedIndex()]);
        }
        break;
      case 'Escape':
        this.isOpen.set(false);
        break;
    }
  }

  selectOption(option: ComboboxOption): void {
    this.optionSelected.emit(option);
    this.searchTerm.set('');
    this.isOpen.set(false);
    this.highlightedIndex.set(0);
  }
}
