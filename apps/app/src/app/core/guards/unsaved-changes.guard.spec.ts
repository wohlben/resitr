import { TestBed } from '@angular/core/testing';
import { confirmUnsavedChanges, hasFormChanges } from './unsaved-changes.guard';
import { ConfirmationService } from '../services/confirmation.service';

describe('unsaved-changes.guard', () => {
  let confirmationService: ConfirmationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConfirmationService],
    });
    confirmationService = TestBed.inject(ConfirmationService);
  });

  describe('confirmUnsavedChanges', () => {
    it('should open confirmation dialog', () => {
      confirmUnsavedChanges(confirmationService, {}, { name: 'Test' });

      expect(confirmationService.isOpen()).toBe(true);
      expect(confirmationService.title()).toBe('Unsaved Changes');
    });

    it('should set isDestructive to true', () => {
      confirmUnsavedChanges(confirmationService, {}, { name: 'Test' });

      expect(confirmationService.isDestructive()).toBe(true);
    });

    it('should resolve to true when accepted', async () => {
      const promise = confirmUnsavedChanges(confirmationService, {}, { name: 'Test' });
      confirmationService.accept();

      await expect(promise).resolves.toBe(true);
    });

    it('should resolve to false when cancelled', async () => {
      const promise = confirmUnsavedChanges(confirmationService, {}, { name: 'Test' });
      confirmationService.cancel();

      await expect(promise).resolves.toBe(false);
    });

    describe('change detection', () => {
      it('should detect added string field', () => {
        confirmUnsavedChanges(confirmationService, {}, { name: 'New Name' });

        const changes = confirmationService.changes();
        expect(changes).toContainEqual({
          field: 'Name',
          oldValue: '',
          newValue: 'New Name',
        });
      });

      it('should detect modified string field', () => {
        confirmUnsavedChanges(
          confirmationService,
          { name: 'Old Name' },
          { name: 'New Name' }
        );

        const changes = confirmationService.changes();
        expect(changes).toContainEqual({
          field: 'Name',
          oldValue: 'Old Name',
          newValue: 'New Name',
        });
      });

      it('should detect removed string field', () => {
        confirmUnsavedChanges(
          confirmationService,
          { description: 'Some description' },
          { description: '' }
        );

        const changes = confirmationService.changes();
        expect(changes).toContainEqual({
          field: 'Description',
          oldValue: 'Some description',
          newValue: '',
        });
      });

      it('should detect array changes', () => {
        confirmUnsavedChanges(
          confirmationService,
          { primaryMuscles: ['chest'] },
          { primaryMuscles: ['chest', 'shoulders'] }
        );

        const changes = confirmationService.changes();
        expect(changes).toContainEqual({
          field: 'Primary Muscles',
          oldValue: 'chest',
          newValue: 'chest, shoulders',
        });
      });

      it('should handle empty array to populated array', () => {
        confirmUnsavedChanges(
          confirmationService,
          { instructions: [] },
          { instructions: ['Step 1', 'Step 2'] }
        );

        const changes = confirmationService.changes();
        expect(changes).toContainEqual({
          field: 'Instructions',
          oldValue: '',
          newValue: 'Step 1, Step 2',
        });
      });

      it('should not include unchanged fields', () => {
        confirmUnsavedChanges(
          confirmationService,
          { name: 'Same', description: 'Changed' },
          { name: 'Same', description: 'New Description' }
        );

        const changes = confirmationService.changes();
        expect(changes.length).toBe(1);
        expect(changes[0].field).toBe('Description');
      });

      it('should include templateId field with friendly label', () => {
        confirmUnsavedChanges(
          confirmationService,
          { templateId: 'old-id' },
          { templateId: 'new-id' }
        );

        const changes = confirmationService.changes();
        expect(changes).toContainEqual({
          field: 'Template ID',
          oldValue: 'old-id',
          newValue: 'new-id',
        });
      });

      it('should use friendly field labels', () => {
        confirmUnsavedChanges(
          confirmationService,
          {},
          {
            displayName: 'Test',
            bodyWeightScaling: 0.5,
            technicalDifficulty: 'intermediate',
          }
        );

        const changes = confirmationService.changes();
        const fieldNames = changes.map(c => c.field);

        expect(fieldNames).toContain('Display Name');
        expect(fieldNames).toContain('Body Weight Scaling');
        expect(fieldNames).toContain('Technical Difficulty');
      });

      it('should handle numeric values', () => {
        confirmUnsavedChanges(
          confirmationService,
          { bodyWeightScaling: 0 },
          { bodyWeightScaling: 0.75 }
        );

        const changes = confirmationService.changes();
        expect(changes).toContainEqual({
          field: 'Body Weight Scaling',
          oldValue: '0',
          newValue: '0.75',
        });
      });

      it('should handle null and undefined as empty', () => {
        confirmUnsavedChanges(
          confirmationService,
          { name: null as unknown as string },
          { name: 'New' }
        );

        const changes = confirmationService.changes();
        expect(changes).toContainEqual({
          field: 'Name',
          oldValue: '',
          newValue: 'New',
        });
      });

      it('should detect multiple changes', () => {
        confirmUnsavedChanges(
          confirmationService,
          { name: 'Old', category: 'A' },
          { name: 'New', category: 'B', description: 'Added' }
        );

        const changes = confirmationService.changes();
        expect(changes.length).toBe(3);
      });

      it('should flatten nested objects with JSON path-like labels', () => {
        confirmUnsavedChanges(
          confirmationService,
          {},
          {
            sections: [
              { type: 'STRENGTH', name: 'Workout', items: [{ exerciseId: 'ex-1' }] }
            ]
          }
        );

        const changes = confirmationService.changes();
        const fieldNames = changes.map(c => c.field);

        expect(fieldNames).toContain('Sections 1 → Type');
        expect(fieldNames).toContain('Sections 1 → Name');
        expect(fieldNames).toContain('Sections 1 → Items 1 → Exercise');
      });

      it('should detect changes in nested objects', () => {
        confirmUnsavedChanges(
          confirmationService,
          {
            sections: [{ type: 'WARMUP', name: 'Old Section' }]
          },
          {
            sections: [{ type: 'STRENGTH', name: 'New Section' }]
          }
        );

        const changes = confirmationService.changes();

        expect(changes).toContainEqual({
          field: 'Sections 1 → Type',
          oldValue: 'WARMUP',
          newValue: 'STRENGTH',
        });
        expect(changes).toContainEqual({
          field: 'Sections 1 → Name',
          oldValue: 'Old Section',
          newValue: 'New Section',
        });
      });

      it('should ignore fields that only exist in oldData (not part of payload)', () => {
        confirmUnsavedChanges(
          confirmationService,
          { name: 'Test', createdBy: 'user-123', createdAt: '2024-01-01' },
          { name: 'Test Changed' }
        );

        const changes = confirmationService.changes();
        const fieldNames = changes.map(c => c.field);

        expect(fieldNames).toContain('Name');
        expect(fieldNames).not.toContain('CreatedBy');
        expect(fieldNames).not.toContain('CreatedAt');
        expect(changes.length).toBe(1);
      });

      it('should ignore fields with undefined value in newData', () => {
        confirmUnsavedChanges(
          confirmationService,
          { name: 'Test', description: 'Old desc' },
          { name: 'Test Changed', description: undefined }
        );

        const changes = confirmationService.changes();
        const fieldNames = changes.map(c => c.field);

        expect(fieldNames).toContain('Name');
        expect(fieldNames).not.toContain('Description');
        expect(changes.length).toBe(1);
      });

      it('should include fields with null value in newData', () => {
        confirmUnsavedChanges(
          confirmationService,
          { name: 'Test', description: 'Old desc' },
          { name: 'Test', description: null as unknown as string }
        );

        const changes = confirmationService.changes();

        expect(changes).toContainEqual({
          field: 'Description',
          oldValue: 'Old desc',
          newValue: '',
        });
      });

      it('should ignore nested fields not in payload', () => {
        confirmUnsavedChanges(
          confirmationService,
          {
            sections: [{
              id: 'section-1',
              type: 'WARMUP',
              name: 'Old Section',
              createdBy: 'user-123',
              workoutSectionItemIds: ['item-1', 'item-2']
            }]
          },
          {
            sections: [{
              type: 'STRENGTH',
              name: 'New Section'
            }]
          }
        );

        const changes = confirmationService.changes();
        const fieldNames = changes.map(c => c.field);

        expect(fieldNames).toContain('Sections 1 → Type');
        expect(fieldNames).toContain('Sections 1 → Name');
        expect(fieldNames).not.toContain('Sections 1 → Id');
        expect(fieldNames).not.toContain('Sections 1 → CreatedBy');
        expect(fieldNames).not.toContain('Sections 1 → WorkoutSectionItemIds');
      });
    });
  });

  describe('hasFormChanges', () => {
    it('should return true when payload field changed', () => {
      const result = hasFormChanges(
        { name: 'Old' },
        { name: 'New' }
      );
      expect(result).toBe(true);
    });

    it('should return false when payload field unchanged', () => {
      const result = hasFormChanges(
        { name: 'Same' },
        { name: 'Same' }
      );
      expect(result).toBe(false);
    });

    it('should ignore fields only in oldData', () => {
      const result = hasFormChanges(
        { name: 'Same', createdBy: 'user-123' },
        { name: 'Same' }
      );
      expect(result).toBe(false);
    });

    it('should ignore undefined fields in newData', () => {
      const result = hasFormChanges(
        { name: 'Same', description: 'Changed' },
        { name: 'Same', description: undefined }
      );
      expect(result).toBe(false);
    });

    it('should detect null as a valid change', () => {
      const result = hasFormChanges(
        { description: 'Old' },
        { description: null as unknown as string }
      );
      expect(result).toBe(true);
    });
  });
});
