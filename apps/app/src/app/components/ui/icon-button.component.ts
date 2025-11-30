import { Component, input, computed } from '@angular/core';

export type IconButtonVariant = 'ghost' | 'danger';
export type IconButtonSize = 'sm' | 'md';

const VARIANT_CLASSES: Record<IconButtonVariant, string> = {
  ghost: 'text-gray-400 hover:text-gray-600 hover:bg-gray-100',
  danger: 'text-gray-400 hover:text-red-600 hover:bg-red-50',
};

const SIZE_CLASSES: Record<IconButtonSize, string> = {
  sm: 'p-0.5',
  md: 'p-1',
};

const BASE_CLASSES = 'rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed';

@Component({
  selector: 'app-icon-button',
  standalone: true,
  template: `
    <button
      [type]="type()"
      [disabled]="disabled()"
      [class]="classes()"
      [attr.aria-label]="ariaLabel()"
      [attr.title]="title()"
    >
      <ng-content />
    </button>
  `,
})
export class IconButtonComponent {
  variant = input<IconButtonVariant>('ghost');
  size = input<IconButtonSize>('md');
  type = input<'button' | 'submit'>('button');
  disabled = input<boolean>(false);
  ariaLabel = input<string>();
  title = input<string>();

  classes = computed(() => {
    const variantClasses = VARIANT_CLASSES[this.variant()];
    const sizeClasses = SIZE_CLASSES[this.size()];
    return `${BASE_CLASSES} ${sizeClasses} ${variantClasses}`;
  });
}
