import { Component, input, output, signal, ElementRef, HostListener, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconButtonComponent } from '../buttons/icon-button.component';

export interface ActionMenuItem {
  id: string;
  label: string;
  icon?: string; // SVG path for the icon
  variant?: 'default' | 'danger';
}

@Component({
  selector: 'app-action-menu',
  standalone: true,
  imports: [CommonModule, IconButtonComponent],
  template: `
    <div class="relative">
      <!-- Trigger button -->
      <app-icon-button
        (click)="toggleMenu($event)"
        [ariaLabel]="ariaLabel()"
        [title]="ariaLabel()"
        size="sm"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </app-icon-button>

      <!-- Dropdown menu -->
      @if (isOpen()) {
        <div
          class="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px]"
          [ngClass]="positionClasses()"
        >
          @for (item of items(); track item.id; let i = $index) {
            <button
              type="button"
              (click)="selectItem(item, $event)"
              (mouseenter)="highlightedIndex.set(i)"
              (keydown)="onKeyDown($event)"
              class="w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors"
              [ngClass]="{
                'bg-gray-100': highlightedIndex() === i && item.variant !== 'danger',
                'bg-red-50': highlightedIndex() === i && item.variant === 'danger',
                'text-gray-700 hover:bg-gray-100': item.variant !== 'danger',
                'text-red-600 hover:bg-red-50': item.variant === 'danger'
              }"
            >
              @if (item.icon) {
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="item.icon" />
                </svg>
              }
              <span>{{ item.label }}</span>
            </button>
          }
        </div>
      }
    </div>
  `,
  host: {
    class: 'inline-block',
  },
})
export class ActionMenuComponent {
  private elementRef = inject(ElementRef);

  items = input.required<ActionMenuItem[]>();
  ariaLabel = input<string>('Actions');
  position = input<'left' | 'right'>('right');

  itemSelected = output<ActionMenuItem>();

  isOpen = signal(false);
  highlightedIndex = signal(0);

  positionClasses = computed(() => {
    return this.position() === 'left' ? 'left-0' : 'right-0';
  });

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  @HostListener('document:keydown', ['$event'])
  onDocumentKeyDown(event: KeyboardEvent): void {
    if (!this.isOpen()) return;

    switch (event.key) {
      case 'Escape':
        this.isOpen.set(false);
        event.preventDefault();
        break;
    }
  }

  toggleMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isOpen.set(!this.isOpen());
    this.highlightedIndex.set(0);
  }

  onKeyDown(event: KeyboardEvent): void {
    const items = this.items();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.highlightedIndex.set(
          Math.min(this.highlightedIndex() + 1, items.length - 1)
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.highlightedIndex.set(Math.max(this.highlightedIndex() - 1, 0));
        break;
      case 'Enter':
        event.preventDefault();
        if (items.length > 0) {
          this.selectItem(items[this.highlightedIndex()], event);
        }
        break;
    }
  }

  selectItem(item: ActionMenuItem, event: Event): void {
    event.stopPropagation();
    this.itemSelected.emit(item);
    this.isOpen.set(false);
    this.highlightedIndex.set(0);
  }
}
