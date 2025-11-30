import { Component, input, output } from '@angular/core';
import { SpinnerComponent } from '../spinner.component';
import { ButtonComponent } from '../button.component';
import { DialogComponent } from '../dialog.component';

@Component({
  selector: 'app-confirm-delete-dialog',
  standalone: true,
  imports: [SpinnerComponent, ButtonComponent, DialogComponent],
  template: `
    <app-dialog
      [open]="show()"
      [preventClose]="isDeleting()"
      (closed)="onCancel()"
    >
      <div dialogIcon class="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
        <svg
          class="w-6 h-6 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      <h3 dialogHeader id="dialog-title" class="mt-4 text-lg font-semibold text-gray-900 text-center">
        Confirm Deletion
      </h3>

      <p dialogBody id="dialog-description" class="mt-2 text-sm text-gray-600 text-center">
        Are you sure you want to delete
        <span class="font-semibold text-gray-900">{{ itemName() }}</span>?
        <br />
        This action cannot be undone.
      </p>

      <div dialogFooter class="mt-6 flex gap-3">
        <app-button
          variant="secondary"
          [fullWidth]="true"
          (click)="onCancel()"
          [disabled]="isDeleting()"
        >
          Cancel
        </app-button>
        <app-button
          variant="danger"
          [fullWidth]="true"
          (click)="onConfirm()"
          [disabled]="isDeleting()"
        >
          @if (isDeleting()) {
            <app-spinner size="small" ariaLabel="Deleting" />
            Deleting...
          } @else {
            Delete
          }
        </app-button>
      </div>
    </app-dialog>
  `,
})
export class ConfirmDeleteDialogComponent {
  show = input.required<boolean>();
  itemName = input.required<string>();
  isDeleting = input<boolean>(false);

  deleteConfirmed = output<void>();
  deleteCancelled = output<void>();

  onConfirm(): void {
    this.deleteConfirmed.emit();
  }

  onCancel(): void {
    if (!this.isDeleting()) {
      this.deleteCancelled.emit();
    }
  }
}
