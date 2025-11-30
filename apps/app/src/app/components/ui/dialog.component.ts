import { Component, input, output, ElementRef, ViewChild, effect, contentChild } from '@angular/core';

@Component({
  selector: 'app-dialog',
  standalone: true,
  template: `
    @if (open()) {
      <div
        #dialogContainer
        class="fixed inset-0 z-50 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="titleId()"
        [attr.aria-describedby]="descriptionId()"
        (keydown)="onKeydown($event)"
      >
        <div
          class="fixed inset-0 bg-black transition-opacity"
          [class.bg-opacity-50]="!preventClose()"
          [class.bg-opacity-60]="preventClose()"
          [class.cursor-not-allowed]="preventClose()"
          (click)="onBackdropClick()"
          role="presentation"
        ></div>

        <div class="flex min-h-full items-center justify-center p-4">
          <div
            class="relative bg-white rounded-lg shadow-xl w-full p-6 transform transition-all"
            [class.max-w-md]="size() === 'md'"
            [class.max-w-lg]="size() === 'lg'"
            [class.max-w-sm]="size() === 'sm'"
            role="document"
          >
            <ng-content select="[dialogIcon]" />
            <ng-content select="[dialogHeader]" />
            <ng-content select="[dialogBody]" />
            <ng-content select="[dialogFooter]" />
          </div>
        </div>
      </div>
    }
  `,
})
export class DialogComponent {
  open = input.required<boolean>();
  preventClose = input<boolean>(false);
  size = input<'sm' | 'md' | 'lg'>('md');
  titleId = input<string>('dialog-title');
  descriptionId = input<string>('dialog-description');

  closed = output<void>();

  @ViewChild('dialogContainer') dialogContainer?: ElementRef<HTMLElement>;

  private focusableElements: HTMLElement[] = [];

  constructor() {
    effect(() => {
      if (this.open()) {
        requestAnimationFrame(() => {
          this.updateFocusableElements();
          this.focusFirstElement();
        });
      }
    });
  }

  private updateFocusableElements(): void {
    const container = this.dialogContainer?.nativeElement;
    if (!container) return;

    this.focusableElements = Array.from(
      container.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter(el => !el.closest('[role="presentation"]'));
  }

  private focusFirstElement(): void {
    const firstFocusable = this.focusableElements[0];
    firstFocusable?.focus();
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && !this.preventClose()) {
      event.preventDefault();
      this.closed.emit();
    } else if (event.key === 'Tab') {
      this.handleTabKey(event);
    }
  }

  private handleTabKey(event: KeyboardEvent): void {
    this.updateFocusableElements();
    const focusable = this.focusableElements;
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  onBackdropClick(): void {
    if (!this.preventClose()) {
      this.closed.emit();
    }
  }
}
