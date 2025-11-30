import { Component, inject } from '@angular/core';
import { ConfirmationService } from '../../core/services/confirmation.service';
import { ButtonComponent } from './button.component';
import { DialogComponent } from './dialog.component';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [ButtonComponent, DialogComponent],
  template: `
    <app-dialog
      [open]="confirmationService.isOpen()"
      titleId="confirmation-title"
      (closed)="onCancel()"
    >
      <h3
        dialogHeader
        id="confirmation-title"
        class="text-lg font-semibold text-gray-900 mb-2"
      >
        {{ confirmationService.title() }}
      </h3>

      <div dialogBody class="mb-6">
        <p class="text-sm text-gray-600">
          {{ confirmationService.message() }}
        </p>

        @if (confirmationService.changes().length > 0) {
          <div class="mt-4 max-h-60 overflow-y-auto">
            <table class="w-full text-sm">
              <thead class="text-left text-gray-500 border-b">
                <tr>
                  <th class="pb-2 font-medium">Field</th>
                  <th class="pb-2 font-medium">Before</th>
                  <th class="pb-2 font-medium">After</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (change of confirmationService.changes(); track change.field) {
                  <tr>
                    <td class="py-2 text-gray-700">{{ change.field }}</td>
                    <td class="py-2 text-red-600 line-through">{{ change.oldValue || '(empty)' }}</td>
                    <td class="py-2 text-green-600">{{ change.newValue || '(empty)' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <div dialogFooter class="flex gap-3 justify-end">
        <app-button variant="secondary" (click)="onCancel()">
          {{ confirmationService.cancelText() }}
        </app-button>
        <app-button
          [variant]="confirmationService.isDestructive() ? 'danger' : 'primary'"
          (click)="onConfirm()"
        >
          {{ confirmationService.confirmText() }}
        </app-button>
      </div>
    </app-dialog>
  `,
})
export class ConfirmationDialogComponent {
  confirmationService = inject(ConfirmationService);

  onCancel(): void {
    this.confirmationService.cancel();
  }

  onConfirm(): void {
    this.confirmationService.accept();
  }
}
