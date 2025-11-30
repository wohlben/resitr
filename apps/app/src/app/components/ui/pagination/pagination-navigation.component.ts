import { Component, input, output } from '@angular/core';
import { ButtonComponent } from '../buttons/button.component';

@Component({
  selector: 'app-pagination-navigation',
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <div class="flex items-center justify-between pt-4 border-t border-gray-200">
      <app-button
        variant="secondary"
        (click)="previousClicked.emit()"
        [disabled]="currentPage() === 1"
      >
        Previous
      </app-button>

      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-700">
          Page {{ currentPage() }} of {{ totalPages() }}
        </span>
      </div>

      <app-button
        variant="secondary"
        (click)="nextClicked.emit()"
        [disabled]="currentPage() === totalPages()"
      >
        Next
      </app-button>
    </div>
  `,
})
export class PaginationNavigationComponent {
  currentPage = input.required<number>();
  totalPages = input.required<number>();

  previousClicked = output<void>();
  nextClicked = output<void>();
}
