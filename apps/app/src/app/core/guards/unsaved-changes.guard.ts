import { CanDeactivateFn } from '@angular/router';
import { CanComponentDeactivate } from './can-component-deactivate';
import { ConfirmationService, FieldChange } from '../services/confirmation.service';

export const unsavedChangesGuard: CanDeactivateFn<CanComponentDeactivate> = (component) => {
  return component.canDeactivate ? component.canDeactivate() : true;
};

/** Field labels for display in the changes dialog */
const FIELD_LABELS: Record<string, string> = {
  templateId: 'Template ID',
  name: 'Name',
  displayName: 'Display Name',
  alternativeNames: 'Alternative Names',
  description: 'Description',
  category: 'Category',
  imageUrl: 'Image URL',
  images: 'Images',
  substitutesFor: 'Substitutes For',
  type: 'Type',
  force: 'Force Types',
  primaryMuscles: 'Primary Muscles',
  secondaryMuscles: 'Secondary Muscles',
  equipmentIds: 'Equipment',
  bodyWeightScaling: 'Body Weight Scaling',
  technicalDifficulty: 'Technical Difficulty',
  instructions: 'Instructions',
  authorName: 'Author Name',
  authorUrl: 'Author URL',
};

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : '';
  return String(value);
}

function computeChanges(oldData: Record<string, unknown>, newData: Record<string, unknown>): FieldChange[] {
  const changes: FieldChange[] = [];
  const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);

  for (const key of allKeys) {
    // Skip internal fields
    if (key === 'templateId') continue;

    const oldValue = formatValue(oldData[key]);
    const newValue = formatValue(newData[key]);

    if (oldValue !== newValue) {
      changes.push({
        field: FIELD_LABELS[key] || key,
        oldValue,
        newValue,
      });
    }
  }

  return changes;
}

/**
 * Shows the standard "unsaved changes" confirmation dialog with a list of changes.
 * @param confirmation - The confirmation service
 * @param oldData - The original data (empty object for new items)
 * @param newData - The current form data
 */
export function confirmUnsavedChanges(
  confirmation: ConfirmationService,
  oldData: Record<string, unknown> = {},
  newData: Record<string, unknown> = {}
): Promise<boolean> {
  const changes = computeChanges(oldData, newData);

  return confirmation.confirm({
    title: 'Unsaved Changes',
    message: 'You have unsaved changes. Do you really want to leave?',
    confirmText: 'Leave',
    cancelText: 'Stay',
    isDestructive: true,
    changes,
  });
}
