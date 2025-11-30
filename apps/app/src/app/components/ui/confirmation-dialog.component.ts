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
          <div class="mt-4 max-h-60 overflow-y-auto space-y-3">
            @for (change of confirmationService.changes(); track change.field) {
              <div class="text-sm border-l-2 border-gray-300 pl-3">
                <div class="font-medium text-gray-700"># {{ change.field }}</div>
                <div class="text-red-600 font-mono">- {{ change.oldValue || '(empty)' }}</div>
                <div class="text-green-600 font-mono">+ {{ change.newValue || '(empty)' }}</div>
              </div>
            }
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
