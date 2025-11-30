import { Injectable, signal } from '@angular/core';

export interface FieldChange {
  field: string;
  oldValue: string;
  newValue: string;
}

/**
 * Service for showing confirmation dialogs.
 * Returns a Promise<boolean> that resolves when the user accepts or cancels.
 * Used by route guards for unsaved changes confirmation.
 */
@Injectable({
  providedIn: 'root',
})
export class ConfirmationService {
  private resolve?: (value: boolean) => void;

  readonly isOpen = signal(false);
  readonly title = signal('');
  readonly message = signal('');
  readonly confirmText = signal('Confirm');
  readonly cancelText = signal('Cancel');
  readonly isDestructive = signal(false);
  readonly changes = signal<FieldChange[]>([]);

  /**
   * Show a confirmation dialog and return a promise that resolves to true/false
   * @param options - Dialog configuration
   * @returns Promise that resolves to true if confirmed, false if cancelled
   */
  confirm(options: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    changes?: FieldChange[];
  }): Promise<boolean> {
    this.title.set(options.title);
    this.message.set(options.message);
    this.confirmText.set(options.confirmText ?? 'Confirm');
    this.cancelText.set(options.cancelText ?? 'Cancel');
    this.isDestructive.set(options.isDestructive ?? false);
    this.changes.set(options.changes ?? []);
    this.isOpen.set(true);

    return new Promise<boolean>((resolve) => {
      this.resolve = resolve;
    });
  }

  /**
   * User accepted the confirmation
   */
  accept(): void {
    this.resolve?.(true);
    this.close();
  }

  /**
   * User cancelled the confirmation
   */
  cancel(): void {
    this.resolve?.(false);
    this.close();
  }

  private close(): void {
    this.isOpen.set(false);
    delete this.resolve;
  }
}
