import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DropdownComponent, DropdownOption } from './dropdown.component';

@Component({
  standalone: true,
  imports: [DropdownComponent, ReactiveFormsModule],
  template: `
    <app-dropdown
      [formControl]="control"
      [label]="label"
      [placeholder]="placeholder"
      [options]="options"
      [required]="required"
      [error]="error"
    />
  `,
})
class TestHostComponent {
  control = new FormControl('');
  label = 'Test Dropdown';
  placeholder = 'Select an option';
  options: DropdownOption[] = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];
  required = false;
  error = '';
}

describe('DropdownComponent', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let selectElement: HTMLSelectElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    selectElement = fixture.nativeElement.querySelector('select');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(selectElement).toBeTruthy();
  });

  describe('options rendering', () => {
    it('should render placeholder option', () => {
      const options = selectElement.querySelectorAll('option');
      expect(options[0].textContent).toBe('Select an option');
      expect(options[0].value).toBe('');
    });

    it('should render all options', () => {
      const options = selectElement.querySelectorAll('option');
      // +1 for placeholder
      expect(options.length).toBe(4);
      expect(options[1].textContent).toBe('Option 1');
      expect(options[1].value).toBe('option1');
    });
  });

  describe('ControlValueAccessor', () => {
    it('should write value to select', () => {
      component.control.setValue('option2');
      fixture.detectChanges();
      expect(selectElement.value).toBe('option2');
    });

    it('should emit value on change', () => {
      selectElement.value = 'option3';
      selectElement.dispatchEvent(new Event('change'));
      expect(component.control.value).toBe('option3');
    });

    it('should handle null/undefined values', () => {
      component.control.setValue(null);
      fixture.detectChanges();
      expect(selectElement.value).toBe('');
    });

    it('should disable select when control is disabled', () => {
      component.control.disable();
      fixture.detectChanges();
      expect(selectElement.disabled).toBe(true);
    });
  });

  describe('label and required', () => {
    it('should display label', () => {
      const label = fixture.nativeElement.querySelector('.text-gray-700');
      expect(label.textContent).toContain('Test Dropdown');
    });

    it('should show required indicator', () => {
      component.required = true;
      fixture.detectChanges();
      const requiredSpan = fixture.nativeElement.querySelector('.text-red-500');
      expect(requiredSpan.textContent).toBe('*');
    });
  });

  describe('error handling', () => {
    it('should display error message', () => {
      component.error = 'Please select an option';
      fixture.detectChanges();
      const errorSpan = fixture.nativeElement.querySelector('.text-red-600');
      expect(errorSpan.textContent).toBe('Please select an option');
    });

    it('should apply error border style', () => {
      component.error = 'Error';
      fixture.detectChanges();
      expect(selectElement.classList.contains('border-red-500')).toBe(true);
    });
  });

  describe('accessibility', () => {
    it('should set aria-label from label', () => {
      expect(selectElement.getAttribute('aria-label')).toBe('Test Dropdown');
    });

    it('should set aria-required when required', () => {
      component.required = true;
      fixture.detectChanges();
      expect(selectElement.getAttribute('aria-required')).toBe('true');
    });

    it('should set aria-invalid when error exists', () => {
      component.error = 'Error';
      fixture.detectChanges();
      expect(selectElement.getAttribute('aria-invalid')).toBe('true');
    });

    it('should set aria-describedby for errors', () => {
      component.error = 'Error';
      fixture.detectChanges();
      expect(selectElement.getAttribute('aria-describedby')).toBe('error-Test Dropdown');
    });
  });

  describe('touched state', () => {
    it('should mark as touched on blur', () => {
      expect(component.control.touched).toBe(false);
      selectElement.dispatchEvent(new Event('blur'));
      expect(component.control.touched).toBe(true);
    });
  });
});
