import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="block bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all p-4">
      <div class="flex gap-4">
        <div class="flex-1 min-w-0">
          <!-- Header: Title (left) and Badge (right) -->
          <div class="flex items-start justify-between gap-4 mb-2">
            <div class="flex-1 min-w-0">
              <ng-content select="[card-title]" />
            </div>
            <div class="flex-shrink-0">
              <ng-content select="[card-badge]" />
            </div>
          </div>

          <!-- Main content area -->
          <div class="mb-2">
            <ng-content select="[card-content]" />
          </div>

          <!-- Footer: Left and Right sections -->
          <div class="flex items-center justify-between text-sm text-gray-600">
            <div class="flex items-center gap-2">
              <ng-content select="[card-footer-left]" />
            </div>
            <div class="flex items-center gap-1">
              <ng-content select="[card-footer-right]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class CardComponent {}
