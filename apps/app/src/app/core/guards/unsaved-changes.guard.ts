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
  suggestedMeasurementParadigms: 'Suggested Measurement Paradigms',
  instructions: 'Instructions',
  authorName: 'Author Name',
  authorUrl: 'Author URL',
  exerciseId: 'Exercise',
  breakBetweenSets: 'Rest Between Sets',
  breakAfter: 'Break After',
  sections: 'Sections',
  items: 'Items',
};

/**
 * Checks if an array contains only primitive values (strings, numbers, booleans).
 */
function isPrimitiveArray(arr: unknown[]): boolean {
  return arr.every(item =>
    typeof item === 'string' ||
    typeof item === 'number' ||
    typeof item === 'boolean'
  );
}

/**
 * Flattens a nested object into a flat object with JSON path-like keys.
 * - Arrays of objects are flattened: { sections: [{ name: 'A' }] } -> { 'sections.0.name': 'A' }
 * - Arrays of primitives are kept as-is: { muscles: ['chest', 'back'] } -> { muscles: ['chest', 'back'] }
 */
function flattenObject(
  obj: unknown,
  prefix = ''
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  if (obj === null || obj === undefined) {
    return result;
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0 || isPrimitiveArray(obj)) {
      // Keep primitive arrays as-is for comma-joined display
      result[prefix] = obj;
    } else {
      // Flatten arrays of objects
      obj.forEach((item, index) => {
        const newPrefix = prefix ? `${prefix}.${index}` : `${index}`;
        Object.assign(result, flattenObject(item, newPrefix));
      });
    }
  } else if (typeof obj === 'object') {
    for (const [key, value] of Object.entries(obj)) {
      const newPrefix = prefix ? `${prefix}.${key}` : key;
      if (value !== null && typeof value === 'object') {
        Object.assign(result, flattenObject(value, newPrefix));
      } else {
        result[newPrefix] = value;
      }
    }
  } else {
    result[prefix] = obj;
  }

  return result;
}

/**
 * Formats a JSON path key into a human-readable label.
 * e.g., 'sections.0.name' -> 'Section 1 Name'
 */
function formatFieldLabel(path: string): string {
  const parts = path.split('.');
  const formatted: string[] = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const isIndex = /^\d+$/.test(part);

    if (isIndex) {
      // Convert 0-based index to 1-based for display
      const num = parseInt(part, 10) + 1;
      // Append number to previous part if exists
      if (formatted.length > 0) {
        formatted[formatted.length - 1] += ` ${num}`;
      } else {
        formatted.push(`Item ${num}`);
      }
    } else {
      const label = FIELD_LABELS[part] || part.charAt(0).toUpperCase() + part.slice(1);
      formatted.push(label);
    }
  }

  return formatted.join(' → ');
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : '';
  return String(value);
}

function computeChanges(
  oldData: Record<string, unknown>,
  newData: Record<string, unknown>
): FieldChange[] {
  const changes: FieldChange[] = [];
  const oldFlat = flattenObject(oldData);
  const newFlat = flattenObject(newData);

  // Get all unique keys from both objects
  const allKeys = new Set([...Object.keys(oldFlat), ...Object.keys(newFlat)]);

  for (const key of allKeys) {
    const oldValue = formatValue(oldFlat[key]);
    const newValue = formatValue(newFlat[key]);

    if (oldValue !== newValue) {
      changes.push({
        field: formatFieldLabel(key),
        oldValue,
        newValue,
      });
    }
  }

  return changes;
}

/**
 * Checks if there are any changes to form fields between two data objects.
 * Supports nested objects by flattening them first.
 */
export function hasFormChanges(
  oldData: Record<string, unknown> = {},
  newData: Record<string, unknown> = {}
): boolean {
  const oldFlat = flattenObject(oldData);
  const newFlat = flattenObject(newData);
  const allKeys = new Set([...Object.keys(oldFlat), ...Object.keys(newFlat)]);

  for (const key of allKeys) {
    const oldValue = formatValue(oldFlat[key]);
    const newValue = formatValue(newFlat[key]);
    if (oldValue !== newValue) {
      return true;
    }
  }
  return false;
}

/**
 * Shows the standard "unsaved changes" confirmation dialog with a list of changes.
 * Supports nested objects by flattening them into JSON path-like keys.
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
