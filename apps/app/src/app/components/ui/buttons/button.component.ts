import { Component, input, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'danger-outline' | 'outline-primary' | 'outline-secondary';
export type ButtonSize = 'sm' | 'md';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'text-white bg-blue-600 border-transparent hover:bg-blue-700 focus:ring-blue-500',
  secondary: 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50 focus:ring-gray-500',
  danger: 'text-white bg-red-600 border-transparent hover:bg-red-700 focus:ring-red-500',
  'danger-outline': 'text-red-700 bg-white border-red-300 hover:bg-red-50 focus:ring-red-500',
  'outline-primary': 'text-blue-600 bg-white border-blue-600 hover:bg-blue-50 focus:ring-blue-500',
  'outline-secondary': 'text-gray-600 bg-white border-gray-600 hover:bg-gray-50 focus:ring-gray-500',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1 text-xs',
  md: 'px-4 py-2 text-sm',
};

const BASE_CLASSES = 'font-medium border rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [RouterLink, NgTemplateOutlet],
  template: `
    @if (link()) {
      <a
        [routerLink]="link()"
        [class]="classes()"
      >
        <ng-container *ngTemplateOutlet="content" />
      </a>
    } @else {
      <button
        [type]="type()"
        [disabled]="disabled()"
        [class]="classes()"
      >
        <ng-container *ngTemplateOutlet="content" />
      </button>
    }

    <ng-template #content>
      <ng-content />
    </ng-template>
  `,
})
export class ButtonComponent {
  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');
  type = input<'button' | 'submit'>('button');
  disabled = input<boolean>(false);
  link = input<string | string[]>();
  fullWidth = input<boolean>(false);

  classes = computed(() => {
    const variantClasses = VARIANT_CLASSES[this.variant()];
    const sizeClasses = SIZE_CLASSES[this.size()];
    const widthClass = this.fullWidth() ? 'w-full justify-center' : '';
    return `${BASE_CLASSES} ${sizeClasses} ${variantClasses} ${widthClass} flex items-center gap-2`.trim();
  });
}
