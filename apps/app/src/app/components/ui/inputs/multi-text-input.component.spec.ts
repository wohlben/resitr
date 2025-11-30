import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MultiTextInputComponent } from './multi-text-input.component';

@Component({
  standalone: true,
  imports: [MultiTextInputComponent, ReactiveFormsModule],
  template: `
    <app-multi-text-input
      [formControl]="control"
      [label]="label"
      [placeholder]="placeholder"
      [required]="required"
      [error]="error"
    />
  `,
})
class TestHostComponent {
  control = new FormControl<string[]>([]);
  label = 'Test Items';
  placeholder = 'Enter item...';
  required = false;
  error = '';
}

describe('MultiTextInputComponent', () => {
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

  describe('initial state', () => {
    it('should show empty state message when no items', () => {
      const emptyMessage = fixture.nativeElement.querySelector('.text-gray-500');
      expect(emptyMessage.textContent).toContain('No items added yet');
    });

    it('should show add button', () => {
      const addButton = fixture.nativeElement.querySelector('button[type="button"]');
      expect(addButton.textContent).toContain('Add Test Items');
    });
  });

  describe('adding items', () => {
    it('should add empty item when clicking add button', () => {
      const addButton = fixture.nativeElement.querySelector('button[type="button"]');
      addButton.click();
      fixture.detectChanges();

      const inputs = fixture.nativeElement.querySelectorAll('input[type="text"]');
      expect(inputs.length).toBe(1);
      expect(component.control.value).toEqual(['']);
    });

    it('should add multiple items', () => {
      const addButton = fixture.nativeElement.querySelector('button[type="button"]');
      addButton.click();
      fixture.detectChanges();
      addButton.click();
      fixture.detectChanges();

      const inputs = fixture.nativeElement.querySelectorAll('input[type="text"]');
      expect(inputs.length).toBe(2);
      expect(component.control.value).toEqual(['', '']);
    });
  });

  describe('removing items', () => {
    beforeEach(() => {
      component.control.setValue(['item1', 'item2', 'item3']);
      fixture.detectChanges();
    });

    it('should remove item when clicking remove button', () => {
      // Find remove buttons within list items (they contain SVG with X icon)
      const listItems = fixture.nativeElement.querySelectorAll('[role="listitem"]');
      const removeButton = listItems[0].querySelector('app-button button');
      removeButton.click();
      fixture.detectChanges();

      expect(component.control.value).toEqual(['item2', 'item3']);
    });
  });

  describe('updating items', () => {
    beforeEach(() => {
      component.control.setValue(['item1']);
      fixture.detectChanges();
    });

    it('should update value on input', () => {
      const input = fixture.nativeElement.querySelector('input[type="text"]');
      input.value = 'updated item';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(component.control.value).toEqual(['updated item']);
    });
  });

  describe('ControlValueAccessor', () => {
    it('should write values', () => {
      component.control.setValue(['a', 'b', 'c']);
      fixture.detectChanges();

      const inputs = fixture.nativeElement.querySelectorAll('input[type="text"]');
      expect(inputs.length).toBe(3);
      expect(inputs[0].value).toBe('a');
      expect(inputs[1].value).toBe('b');
      expect(inputs[2].value).toBe('c');
    });

    it('should handle null value', () => {
      component.control.setValue(null);
      fixture.detectChanges();

      const emptyMessage = fixture.nativeElement.querySelector('.text-gray-500');
      expect(emptyMessage).toBeTruthy();
    });

    it('should disable inputs when control is disabled', () => {
      component.control.setValue(['item1']);
      component.control.disable();
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input[type="text"]');
      expect(input.disabled).toBe(true);
    });
  });

  describe('blur behavior', () => {
    it('should remove empty items on blur', () => {
      // Add an item first
      component.control.setValue(['']);
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input[type="text"]');
      input.dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      expect(component.control.value).toEqual([]);
    });

    it('should keep non-empty items on blur', () => {
      component.control.setValue(['keep this']);
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input[type="text"]');
      input.dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      expect(component.control.value).toEqual(['keep this']);
    });
  });

  describe('accessibility', () => {
    beforeEach(() => {
      component.control.setValue(['item1']);
      fixture.detectChanges();
    });

    it('should have role=list on container', () => {
      const list = fixture.nativeElement.querySelector('[role="list"]');
      expect(list).toBeTruthy();
    });

    it('should have aria-label on inputs', () => {
      const input = fixture.nativeElement.querySelector('input[type="text"]');
      expect(input.getAttribute('aria-label')).toBe('Test Items item 1');
    });

    it('should have aria-label on remove button', () => {
      // Remove button is within list item
      const listItem = fixture.nativeElement.querySelector('[role="listitem"]');
      const removeButton = listItem.querySelector('app-button');
      expect(removeButton.getAttribute('aria-label')).toBe('Remove Test Items item 1');
    });

    it('should have aria-label on add button', () => {
      // Add button is after the list container, find by text content
      const buttons = fixture.nativeElement.querySelectorAll('app-button');
      const addButton = Array.from(buttons).find(
        (btn: Element) => btn.textContent?.includes('Add')
      );
      expect(addButton?.getAttribute('aria-label')).toBe('Add new Test Items item');
    });
  });

  describe('error handling', () => {
    it('should display error message', () => {
      component.error = 'At least one item is required';
      fixture.detectChanges();

      const errorSpan = fixture.nativeElement.querySelector('.text-red-600');
      expect(errorSpan.textContent).toBe('At least one item is required');
    });
  });
});
