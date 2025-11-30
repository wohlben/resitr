import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NumberInputComponent } from './number-input.component';

@Component({
  standalone: true,
  imports: [NumberInputComponent, ReactiveFormsModule],
  template: `
    <app-number-input
      [formControl]="control"
      [label]="label"
      [placeholder]="placeholder"
      [required]="required"
      [min]="min"
      [max]="max"
      [step]="step"
      [error]="error"
    />
  `,
})
class TestHostComponent {
  control = new FormControl<number | null>(null);
  label = 'Test Number';
  placeholder = 'Enter number...';
  required = false;
  min: number | undefined = undefined;
  max: number | undefined = undefined;
  step: number | undefined = undefined;
  error = '';
}

describe('NumberInputComponent', () => {
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
    expect(inputElement.type).toBe('number');
  });

  describe('ControlValueAccessor', () => {
    it('should write value to input', () => {
      component.control.setValue(42);
      fixture.detectChanges();
      expect(inputElement.value).toBe('42');
    });

    it('should emit value on input', () => {
      inputElement.value = '123';
      inputElement.dispatchEvent(new Event('input'));
      expect(component.control.value).toBe(123);
    });

    it('should handle null values', () => {
      component.control.setValue(null);
      fixture.detectChanges();
      expect(inputElement.value).toBe('');
    });

    it('should emit null for empty input', () => {
      component.control.setValue(42);
      fixture.detectChanges();
      inputElement.value = '';
      inputElement.dispatchEvent(new Event('input'));
      expect(component.control.value).toBeNull();
    });

    it('should disable input when control is disabled', () => {
      component.control.disable();
      fixture.detectChanges();
      expect(inputElement.disabled).toBe(true);
    });

    it('should handle decimal values', () => {
      inputElement.value = '3.14';
      inputElement.dispatchEvent(new Event('input'));
      expect(component.control.value).toBe(3.14);
    });
  });

  describe('min/max/step attributes', () => {
    it('should apply min attribute', () => {
      component.min = 0;
      fixture.detectChanges();
      expect(inputElement.getAttribute('min')).toBe('0');
    });

    it('should apply max attribute', () => {
      component.max = 100;
      fixture.detectChanges();
      expect(inputElement.getAttribute('max')).toBe('100');
    });

    it('should apply step attribute', () => {
      component.step = 0.5;
      fixture.detectChanges();
      expect(inputElement.getAttribute('step')).toBe('0.5');
    });
  });

  describe('accessibility', () => {
    it('should set aria-label from label', () => {
      expect(inputElement.getAttribute('aria-label')).toBe('Test Number');
    });

    it('should set aria-required when required', () => {
      component.required = true;
      fixture.detectChanges();
      expect(inputElement.getAttribute('aria-required')).toBe('true');
    });

    it('should set aria-valuemin', () => {
      component.min = 0;
      fixture.detectChanges();
      expect(inputElement.getAttribute('aria-valuemin')).toBe('0');
    });

    it('should set aria-valuemax', () => {
      component.max = 100;
      fixture.detectChanges();
      expect(inputElement.getAttribute('aria-valuemax')).toBe('100');
    });

    it('should set aria-valuenow', () => {
      component.control.setValue(50);
      fixture.detectChanges();
      expect(inputElement.getAttribute('aria-valuenow')).toBe('50');
    });

    it('should set aria-invalid when error exists', () => {
      component.error = 'Error';
      fixture.detectChanges();
      expect(inputElement.getAttribute('aria-invalid')).toBe('true');
    });
  });

  describe('error handling', () => {
    it('should display error message', () => {
      component.error = 'Must be a number';
      fixture.detectChanges();
      const errorSpan = fixture.nativeElement.querySelector('.text-red-600');
      expect(errorSpan.textContent).toBe('Must be a number');
    });

    it('should apply error border style', () => {
      component.error = 'Error';
      fixture.detectChanges();
      expect(inputElement.classList.contains('border-red-500')).toBe(true);
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
