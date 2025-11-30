import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MultiSelectComponent, MultiSelectOption } from './multi-select.component';

@Component({
  standalone: true,
  imports: [MultiSelectComponent, ReactiveFormsModule],
  template: `
    <app-multi-select
      [formControl]="control"
      [label]="label"
      [options]="options"
      [required]="required"
      [showSearch]="showSearch"
      [error]="error"
    />
  `,
})
class TestHostComponent {
  control = new FormControl<string[]>([]);
  label = 'Test Selection';
  options: MultiSelectOption[] = [
    { value: 'opt1', label: 'Option 1', description: 'First option' },
    { value: 'opt2', label: 'Option 2', description: 'Second option' },
    { value: 'opt3', label: 'Option 3' },
    { value: 'opt4', label: 'Option 4' },
    { value: 'opt5', label: 'Option 5' },
    { value: 'opt6', label: 'Option 6' },
  ];
  required = false;
  showSearch = true;
  error = '';
}

describe('MultiSelectComponent', () => {
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

  describe('options rendering', () => {
    it('should render all options', () => {
      const checkboxes = fixture.nativeElement.querySelectorAll('input[type="checkbox"]');
      expect(checkboxes.length).toBe(6);
    });

    it('should render option labels', () => {
      const labels = fixture.nativeElement.querySelectorAll('[role="group"] .text-gray-900');
      expect(labels[0].textContent.trim()).toBe('Option 1');
    });

    it('should render option descriptions', () => {
      const descriptions = fixture.nativeElement.querySelectorAll('.text-gray-500');
      expect(descriptions[0].textContent).toBe('First option');
    });
  });

  describe('ControlValueAccessor', () => {
    it('should write values', () => {
      component.control.setValue(['opt1', 'opt2']);
      fixture.detectChanges();

      const checkboxes = fixture.nativeElement.querySelectorAll('input[type="checkbox"]');
      expect(checkboxes[0].checked).toBe(true);
      expect(checkboxes[1].checked).toBe(true);
      expect(checkboxes[2].checked).toBe(false);
    });

    it('should emit value on checkbox change', () => {
      const checkbox = fixture.nativeElement.querySelector('input[type="checkbox"]');
      checkbox.click();
      fixture.detectChanges();

      expect(component.control.value).toContain('opt1');
    });

    it('should handle null value', () => {
      component.control.setValue(null);
      fixture.detectChanges();

      const checkboxes = fixture.nativeElement.querySelectorAll('input[type="checkbox"]:checked');
      expect(checkboxes.length).toBe(0);
    });

    it('should disable checkboxes when control is disabled', () => {
      component.control.disable();
      fixture.detectChanges();

      const checkboxes = fixture.nativeElement.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach((checkbox: HTMLInputElement) => {
        expect(checkbox.disabled).toBe(true);
      });
    });
  });

  describe('select/clear all', () => {
    it('should select all options when clicking Select All', () => {
      const selectAllButton = fixture.nativeElement.querySelector('button.text-blue-600');
      selectAllButton.click();
      fixture.detectChanges();

      expect(component.control.value?.length).toBe(6);
    });

    it('should clear all options when clicking Clear All', () => {
      component.control.setValue(['opt1', 'opt2', 'opt3']);
      fixture.detectChanges();

      const clearAllButton = fixture.nativeElement.querySelector('button.text-gray-600');
      clearAllButton.click();
      fixture.detectChanges();

      expect(component.control.value).toEqual([]);
    });
  });

  describe('search functionality', () => {
    it('should show search input when options > 5', () => {
      const searchInput = fixture.nativeElement.querySelector('input[type="text"]');
      expect(searchInput).toBeTruthy();
    });

    it('should hide search input when options <= 5', () => {
      component.options = component.options.slice(0, 5);
      fixture.detectChanges();

      const searchInput = fixture.nativeElement.querySelector('input[type="text"]');
      expect(searchInput).toBeNull();
    });

    it('should filter options based on search', () => {
      const searchInput = fixture.nativeElement.querySelector('input[type="text"]');
      searchInput.value = 'Option 1';
      searchInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const checkboxes = fixture.nativeElement.querySelectorAll('input[type="checkbox"]');
      expect(checkboxes.length).toBe(1);
    });

    it('should filter by description', () => {
      const searchInput = fixture.nativeElement.querySelector('input[type="text"]');
      searchInput.value = 'First';
      searchInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const checkboxes = fixture.nativeElement.querySelectorAll('input[type="checkbox"]');
      expect(checkboxes.length).toBe(1);
    });

    it('should show empty state when no options match', () => {
      const searchInput = fixture.nativeElement.querySelector('input[type="text"]');
      searchInput.value = 'nonexistent';
      searchInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const emptyState = fixture.nativeElement.querySelector('.text-center');
      expect(emptyState.textContent).toContain('No options found');
    });
  });

  describe('toggle behavior', () => {
    it('should toggle selection on click', () => {
      const checkbox = fixture.nativeElement.querySelector('input[type="checkbox"]');

      // Select
      checkbox.click();
      fixture.detectChanges();
      expect(component.control.value).toContain('opt1');

      // Deselect
      checkbox.click();
      fixture.detectChanges();
      expect(component.control.value).not.toContain('opt1');
    });
  });

  describe('accessibility', () => {
    it('should have role=group on container', () => {
      const group = fixture.nativeElement.querySelector('[role="group"]');
      expect(group).toBeTruthy();
    });

    it('should have aria-label on checkboxes', () => {
      const checkbox = fixture.nativeElement.querySelector('input[type="checkbox"]');
      expect(checkbox.getAttribute('aria-label')).toBe('Option 1: First option');
    });

    it('should have aria-label without description', () => {
      const checkboxes = fixture.nativeElement.querySelectorAll('input[type="checkbox"]');
      expect(checkboxes[2].getAttribute('aria-label')).toBe('Option 3');
    });
  });

  describe('error handling', () => {
    it('should display error message', () => {
      component.error = 'At least one option is required';
      fixture.detectChanges();

      const errorSpan = fixture.nativeElement.querySelector('.text-red-600');
      expect(errorSpan.textContent).toBe('At least one option is required');
    });
  });
});
