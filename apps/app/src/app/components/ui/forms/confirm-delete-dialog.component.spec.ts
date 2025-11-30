import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { ConfirmDeleteDialogComponent } from './confirm-delete-dialog.component';

@Component({
  standalone: true,
  imports: [ConfirmDeleteDialogComponent],
  template: `
    <app-confirm-delete-dialog
      [show]="show()"
      [itemName]="itemName()"
      [isDeleting]="isDeleting()"
      (deleteConfirmed)="onConfirm()"
      (deleteCancelled)="onCancel()"
    />
  `,
})
class TestHostComponent {
  show = signal(false);
  itemName = signal('Test Item');
  isDeleting = signal(false);
  confirmCalled = false;
  cancelCalled = false;

  onConfirm(): void {
    this.confirmCalled = true;
  }

  onCancel(): void {
    this.cancelCalled = true;
  }
}

describe('ConfirmDeleteDialogComponent', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('visibility', () => {
    it('should not render when show is false', () => {
      component.show.set(false);
      fixture.detectChanges();

      const dialog = fixture.nativeElement.querySelector('[role="dialog"]');
      expect(dialog).toBeNull();
    });

    it('should render when show is true', () => {
      component.show.set(true);
      fixture.detectChanges();

      const dialog = fixture.nativeElement.querySelector('[role="dialog"]');
      expect(dialog).toBeTruthy();
    });
  });

  describe('content', () => {
    beforeEach(() => {
      component.show.set(true);
      fixture.detectChanges();
    });

    it('should display item name', () => {
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Test Item');
    });

    it('should display confirmation message', () => {
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Are you sure you want to delete');
    });

    it('should show cancel and delete buttons', () => {
      const buttons = fixture.nativeElement.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('actions', () => {
    beforeEach(() => {
      component.show.set(true);
      fixture.detectChanges();
    });

    it('should emit deleteConfirmed when clicking delete button', () => {
      const deleteButton = fixture.nativeElement.querySelector('button.bg-red-600');
      deleteButton.click();

      expect(component.confirmCalled).toBe(true);
    });

    it('should emit deleteCancelled when clicking cancel button', () => {
      const cancelButton = fixture.nativeElement.querySelector('button.bg-white');
      cancelButton.click();

      expect(component.cancelCalled).toBe(true);
    });
  });

  describe('deleting state', () => {
    beforeEach(() => {
      component.show.set(true);
      component.isDeleting.set(true);
      fixture.detectChanges();
    });

    it('should disable buttons when deleting', () => {
      const cancelButton = fixture.nativeElement.querySelector('button.bg-white');
      const deleteButton = fixture.nativeElement.querySelector('button.bg-red-600');

      expect(cancelButton.disabled).toBe(true);
      expect(deleteButton.disabled).toBe(true);
    });

    it('should show loading text when deleting', () => {
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Deleting...');
    });

    it('should not emit cancel when backdrop clicked while deleting', () => {
      const backdrop = fixture.nativeElement.querySelector('[role="presentation"]');
      backdrop.click();

      expect(component.cancelCalled).toBe(false);
    });
  });

  describe('accessibility', () => {
    beforeEach(() => {
      component.show.set(true);
      fixture.detectChanges();
    });

    it('should have role=dialog', () => {
      const dialog = fixture.nativeElement.querySelector('[role="dialog"]');
      expect(dialog).toBeTruthy();
    });

    it('should have aria-modal=true', () => {
      const dialog = fixture.nativeElement.querySelector('[aria-modal="true"]');
      expect(dialog).toBeTruthy();
    });

    it('should have aria-labelledby', () => {
      const dialog = fixture.nativeElement.querySelector('[aria-labelledby]');
      expect(dialog).toBeTruthy();
    });

    it('should have aria-describedby', () => {
      const dialog = fixture.nativeElement.querySelector('[aria-describedby]');
      expect(dialog).toBeTruthy();
    });

    it('should show spinner in delete button when deleting', () => {
      component.isDeleting.set(true);
      fixture.detectChanges();

      const spinner = fixture.nativeElement.querySelector('app-spinner');
      expect(spinner).toBeTruthy();
    });
  });

  describe('keyboard handling', () => {
    beforeEach(() => {
      component.show.set(true);
      fixture.detectChanges();
    });

    it('should emit cancel on Escape key', () => {
      const dialog = fixture.nativeElement.querySelector('[role="dialog"]');
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      dialog.dispatchEvent(event);

      expect(component.cancelCalled).toBe(true);
    });

    it('should not cancel on Escape when deleting', () => {
      component.isDeleting.set(true);
      fixture.detectChanges();

      const dialog = fixture.nativeElement.querySelector('[role="dialog"]');
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      dialog.dispatchEvent(event);

      expect(component.cancelCalled).toBe(false);
    });
  });
});
