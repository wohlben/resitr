import { Component, computed, effect, inject, input, ElementRef, viewChild } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { PaginationNavigationComponent } from './pagination-navigation.component';
import { PaginationInfoComponent } from './pagination-info.component';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [PaginationNavigationComponent, PaginationInfoComponent],
  template: `
    <div class="space-y-4 py-4" #paginationContainer>
      <!-- Pagination Info -->
      <app-pagination-info
        [currentCount]="paginatedItems().length"
        [filteredCount]="items().length"
        [totalCount]="items().length"
        [itemsPerPage]="itemsPerPage()"
        [itemName]="itemName()"
        (itemsPerPageChange)="onItemsPerPageChange($event)"
      />

      <!-- Content Projection with context -->
      <ng-content select="[paginationContent]"></ng-content>

      <!-- Pagination Navigation -->
      @if (totalPages() > 1) {
        <app-pagination-navigation
          [currentPage]="currentPage()"
          [totalPages]="totalPages()"
          (previousClicked)="previousPage()"
          (nextClicked)="nextPage()"
        />
      }
    </div>
  `,
})
export class PaginationComponent<T> {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  items = input.required<T[]>();
  itemName = input<string>('items');

  private readonly paginationContainer = viewChild<ElementRef>('paginationContainer');
  private readonly queryParams = toSignal(this.route.queryParams, { initialValue: {} as Params });
  private previousPageNumber = 0;

  currentPage = computed(() => {
    const params = this.queryParams();
    const pageParam = params['page'];
    const page = parseInt(typeof pageParam === 'string' ? pageParam : '1', 10);
    return Math.max(1, page);
  });

  itemsPerPage = computed(() => {
    const params = this.queryParams();
    const perPageParam = params['perPage'];
    const perPage = parseInt(typeof perPageParam === 'string' ? perPageParam : '25', 10);
    return [10, 25, 50, 100].includes(perPage) ? perPage : 25;
  });

  totalPages = computed(() => {
    const total = this.items().length;
    const perPage = this.itemsPerPage();
    return Math.max(1, Math.ceil(total / perPage));
  });

  paginatedItems = computed(() => {
    const page = this.currentPage();
    const perPage = this.itemsPerPage();
    const all = this.items();
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    return all.slice(startIndex, endIndex);
  });

  constructor() {
    effect(() => {
      const currentPage = this.currentPage();
      const totalPages = this.totalPages();

      if (currentPage > totalPages && totalPages > 0) {
        this.updateQueryParams(1, this.itemsPerPage()).then();
      }
    });

    effect(() => {
      const currentPage = this.currentPage();

      if (this.previousPageNumber !== 0 && currentPage !== this.previousPageNumber) {
        queueMicrotask(() => this.scrollToTop());
      }

      this.previousPageNumber = currentPage;
    });
  }

  private scrollToTop(): void {
    const container = this.paginationContainer();
    if (container?.nativeElement) {
      container.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  async previousPage(): Promise<boolean> {
    const current = this.currentPage();
    if (current > 1) {
      return this.updateQueryParams(current - 1, this.itemsPerPage());
    }
    return false;
  }

  async nextPage(): Promise<boolean> {
    const current = this.currentPage();
    const total = this.totalPages();
    if (current < total) {
      return this.updateQueryParams(current + 1, this.itemsPerPage());
    }
    return false;
  }

  async onItemsPerPageChange(newPerPage: number): Promise<boolean> {
    return this.updateQueryParams(1, newPerPage);
  }

  private async updateQueryParams(page: number, perPage: number): Promise<boolean> {
    return this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page, perPage },
      queryParamsHandling: 'merge',
    });
  }
}
