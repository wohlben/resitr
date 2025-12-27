import { Component, input } from '@angular/core';
import { ButtonComponent } from '../buttons/button.component';

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
      <div class="flex gap-3 items-center">
        <app-button variant="secondary" [link]="backLink()">
          Back to List
        </app-button>
        @if (actionLink()) {
          <app-button variant="outline-secondary" [link]="actionLink()!">
            {{ actionLabel() }}
          </app-button>
        }
        <ng-content select="[header-actions]" />
        <ng-content select="[header-primary-action]" />
      </div>
    </div>
  `,
})
export class DetailPageHeaderComponent {
  title = input.required<string>();
  subtitle = input<string>();
  backLink = input.required<string | string[]>();
  actionLink = input<string | string[] | null>();
  actionLabel = input<string>();
}
