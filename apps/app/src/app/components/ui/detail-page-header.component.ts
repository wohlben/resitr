import { Component, input } from '@angular/core';
import { ButtonComponent } from './button.component';

@Component({
  selector: 'app-detail-page-header',
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">{{ title() }}</h1>
        @if (subtitle()) {
          <p class="text-gray-600 mt-1">{{ subtitle() }}</p>
        }
      </div>
      <div class="flex gap-3">
        <app-button variant="secondary" [link]="backLink()">
          Back to List
        </app-button>
        <app-button variant="primary" [link]="editLink()">
          {{ editLabel() }}
        </app-button>
      </div>
    </div>
  `,
})
export class DetailPageHeaderComponent {
  title = input.required<string>();
  subtitle = input<string>();
  backLink = input.required<string | string[]>();
  editLink = input.required<string | string[]>();
  editLabel = input<string>('Edit');
}
