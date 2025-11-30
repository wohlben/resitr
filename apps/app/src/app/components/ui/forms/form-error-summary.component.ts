import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-error-summary',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (errors().length > 0) {
      <div class="p-4 bg-red-50 border border-red-200 rounded-lg" role="alert" aria-live="polite">
        @if (errors().length === 1) {
          <p class="text-sm text-red-800">{{ errors()[0] }}</p>
        } @else {
          <h4 class="text-sm font-semibold text-red-800 mb-2">
            {{ title() }}
          </h4>
          <ul class="text-sm text-red-700 list-disc list-inside space-y-1">
            @for (error of errors(); track error) {
              <li>{{ error }}</li>
            }
          </ul>
        }
      </div>
    }
  `,
})
export class FormErrorSummaryComponent {
  errors = input.required<string[]>();
  title = input<string>('Please fix the following errors:');
}
