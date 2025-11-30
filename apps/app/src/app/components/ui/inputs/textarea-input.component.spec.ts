import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TextareaInputComponent } from './textarea-input.component';

@Component({
  standalone: true,
  imports: [TextareaInputComponent, ReactiveFormsModule],
  template: `
    <app-textarea-input
      [formControl]="control"
      [label]="label"
      [placeholder]="placeholder"
      [rows]="rows"
      [required]="required"
      [error]="error"
    />
  `,
})
class TestHostComponent {
  control = new FormControl('');
  label = 'Test Textarea';
  placeholder = 'Enter description...';
  rows = 3;
  required = false;
  error = '';
}

describe('TextareaInputComponent', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let textareaElement: HTMLTextAreaElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    textareaElement = fixture.nativeElement.querySelector('textarea');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(textareaElement).toBeTruthy();
  });

  describe('ControlValueAccessor', () => {
    it('should write value to textarea', () => {
      component.control.setValue('test description');
      fixture.detectChanges();
      expect(textareaElement.value).toBe('test description');
    });

    it('should emit value on input', () => {
      textareaElement.value = 'new description';
      textareaElement.dispatchEvent(new Event('input'));
      expect(component.control.value).toBe('new description');
    });

    it('should handle null/undefined values', () => {
      component.control.setValue(null);
      fixture.detectChanges();
      expect(textareaElement.value).toBe('');
    });

    it('should disable textarea when control is disabled', () => {
      component.control.disable();
      fixture.detectChanges();
      expect(textareaElement.disabled).toBe(true);
    });

    it('should handle multiline text', () => {
      const multilineText = 'Line 1\nLine 2\nLine 3';
      component.control.setValue(multilineText);
      fixture.detectChanges();
      expect(textareaElement.value).toBe(multilineText);
    });
  });

  describe('rows attribute', () => {
    it('should apply default rows', () => {
      expect(textareaElement.rows).toBe(3);
    });

    it('should apply custom rows', () => {
      component.rows = 6;
      fixture.detectChanges();
      expect(textareaElement.rows).toBe(6);
    });
  });

  describe('label and required', () => {
    it('should display label', () => {
      const label = fixture.nativeElement.querySelector('.text-gray-700');
      expect(label.textContent).toContain('Test Textarea');
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
      component.error = 'Description is required';
      fixture.detectChanges();
      const errorSpan = fixture.nativeElement.querySelector('.text-red-600');
      expect(errorSpan.textContent).toBe('Description is required');
    });

    it('should apply error border style', () => {
      component.error = 'Error';
      fixture.detectChanges();
      expect(textareaElement.classList.contains('border-red-500')).toBe(true);
    });

    it('should set aria-invalid when error exists', () => {
      component.error = 'Error';
      fixture.detectChanges();
      expect(textareaElement.getAttribute('aria-invalid')).toBe('true');
    });
  });

  describe('accessibility', () => {
    it('should set aria-label from label', () => {
      expect(textareaElement.getAttribute('aria-label')).toBe('Test Textarea');
    });

    it('should set aria-required when required', () => {
      component.required = true;
      fixture.detectChanges();
      expect(textareaElement.getAttribute('aria-required')).toBe('true');
    });

    it('should set aria-describedby for errors', () => {
      component.error = 'Error';
      fixture.detectChanges();
      expect(textareaElement.getAttribute('aria-describedby')).toBe('error-Test Textarea');
    });
  });

  describe('touched state', () => {
    it('should mark as touched on blur', () => {
      expect(component.control.touched).toBe(false);
      textareaElement.dispatchEvent(new Event('blur'));
      expect(component.control.touched).toBe(true);
    });
  });
});
