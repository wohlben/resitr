import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TextInputComponent } from './text-input.component';

@Component({
  standalone: true,
  imports: [TextInputComponent, ReactiveFormsModule],
  template: `
    <app-text-input
      [formControl]="control"
      [label]="label"
      [placeholder]="placeholder"
      [type]="type"
      [required]="required"
      [error]="error"
    />
  `,
})
class TestHostComponent {
  control = new FormControl('');
  label = 'Test Label';
  placeholder = 'Enter text...';
  type = 'text';
  required = false;
  error = '';
}

describe('TextInputComponent', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let inputElement: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    inputElement = fixture.nativeElement.querySelector('input');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(inputElement).toBeTruthy();
  });

  describe('ControlValueAccessor', () => {
    it('should write value to input', () => {
      component.control.setValue('test value');
      fixture.detectChanges();
      expect(inputElement.value).toBe('test value');
    });

    it('should emit value on input', () => {
      inputElement.value = 'new value';
      inputElement.dispatchEvent(new Event('input'));
      expect(component.control.value).toBe('new value');
    });

    it('should handle null/undefined values', () => {
      component.control.setValue(null);
      fixture.detectChanges();
      expect(inputElement.value).toBe('');
    });

    it('should disable input when control is disabled', () => {
      component.control.disable();
      fixture.detectChanges();
      expect(inputElement.disabled).toBe(true);
    });
  });

  describe('label and required', () => {
    it('should display label', () => {
      const label = fixture.nativeElement.querySelector('.text-gray-700');
      expect(label.textContent).toContain('Test Label');
    });

    it('should show required indicator', () => {
      component.required = true;
      fixture.detectChanges();
      const requiredSpan = fixture.nativeElement.querySelector('.text-red-500');
      expect(requiredSpan.textContent).toBe('*');
    });

    it('should hide label when not provided', async () => {
      component.label = '';
      fixture.detectChanges();
      await fixture.whenStable();
      const label = fixture.nativeElement.querySelector('.text-gray-700');
      expect(label).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should display error message', () => {
      component.error = 'This field is required';
      fixture.detectChanges();
      const errorSpan = fixture.nativeElement.querySelector('.text-red-600');
      expect(errorSpan.textContent).toBe('This field is required');
    });

    it('should apply error border style', () => {
      component.error = 'Error';
      fixture.detectChanges();
      expect(inputElement.classList.contains('border-red-500')).toBe(true);
    });

    it('should set aria-invalid when error exists', () => {
      component.error = 'Error';
      fixture.detectChanges();
      expect(inputElement.getAttribute('aria-invalid')).toBe('true');
    });
  });

  describe('accessibility', () => {
    it('should set aria-label from label', () => {
      expect(inputElement.getAttribute('aria-label')).toBe('Test Label');
    });

    it('should set aria-label from placeholder when no label', async () => {
      component.label = '';
      fixture.detectChanges();
      await fixture.whenStable();
      expect(inputElement.getAttribute('aria-label')).toBe('Enter text...');
    });

    it('should set aria-required when required', () => {
      component.required = true;
      fixture.detectChanges();
      expect(inputElement.getAttribute('aria-required')).toBe('true');
    });

    it('should set aria-describedby for errors', () => {
      component.error = 'Error';
      fixture.detectChanges();
      expect(inputElement.getAttribute('aria-describedby')).toBe('error-Test Label');
    });
  });

  describe('input types', () => {
    it('should support text type', () => {
      component.type = 'text';
      fixture.detectChanges();
      expect(inputElement.type).toBe('text');
    });

    it('should support url type', () => {
      component.type = 'url';
      fixture.detectChanges();
      expect(inputElement.type).toBe('url');
    });

    it('should support email type', () => {
      component.type = 'email';
      fixture.detectChanges();
      expect(inputElement.type).toBe('email');
    });
  });

  describe('touched state', () => {
    it('should mark as touched on blur', () => {
      expect(component.control.touched).toBe(false);
      inputElement.dispatchEvent(new Event('blur'));
      expect(component.control.touched).toBe(true);
    });
  });
});
