import { Component, input } from '@angular/core';

@Component({
  selector: 'app-detail-field',
  standalone: true,
  template: `
    <div>
      <h3 class="text-sm font-medium text-gray-500">{{ label() }}</h3>
      @if (value()) {
        <p class="mt-1 text-sm text-gray-900" [class.font-mono]="mono()">
          {{ value() }}
        </p>
      } @else {
        <p class="mt-1 text-sm text-gray-400 italic">{{ emptyText() }}</p>
      }
    </div>
  `,
})
export class DetailFieldComponent {
  label = input.required<string>();
  value = input<string | null>();
  mono = input<boolean>(false);
  emptyText = input<string>('Not specified');
}
