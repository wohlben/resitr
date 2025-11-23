import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination-navigation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-between pt-4 border-t border-gray-200">
      <button
        (click)="previousClicked.emit()"
        [disabled]="currentPage() === 1"
        [class.opacity-50]="currentPage() === 1"
        [class.cursor-not-allowed]="currentPage() === 1"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:hover:bg-white"
      >
        Previous
      </button>

      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-700">
          Page {{ currentPage() }} of {{ totalPages() }}
        </span>
      </div>

      <button
        (click)="nextClicked.emit()"
        [disabled]="currentPage() === totalPages()"
        [class.opacity-50]="currentPage() === totalPages()"
        [class.cursor-not-allowed]="currentPage() === totalPages()"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:hover:bg-white"
      >
        Next
      </button>
    </div>
  `,
})
export class PaginationNavigationComponent {
  currentPage = input.required<number>();
  totalPages = input.required<number>();

  previousClicked = output<void>();
  nextClicked = output<void>();
}
