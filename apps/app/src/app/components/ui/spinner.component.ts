import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg
      class="animate-spin"
      [class.h-4]="size() === 'small'"
      [class.w-4]="size() === 'small'"
      [class.h-6]="size() === 'medium'"
      [class.w-6]="size() === 'medium'"
      [class.h-8]="size() === 'large'"
      [class.w-8]="size() === 'large'"
      fill="none"
      viewBox="0 0 24 24"
      role="status"
      [attr.aria-label]="ariaLabel()"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  `,
})
export class SpinnerComponent {
  size = input<'small' | 'medium' | 'large'>('small');
  ariaLabel = input<string>('Loading');
}
