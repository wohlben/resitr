import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { EquipmentFormComponent } from './equipment-form.component';
import type { EquipmentResponseDto } from '@resitr/api';

@Component({
  standalone: true,
  imports: [EquipmentFormComponent],
  template: `
    <app-equipment-form
      [initialValue]="initialValue()"
      [isEditMode]="isEditMode()"
      (formChange)="onFormChange($event)"
      (validChange)="onValidChange($event)"
    />
  `,
})
class TestHostComponent {
  initialValue = signal<EquipmentResponseDto | null>(null);
  isEditMode = signal(false);
  formData: unknown = null;
  isValid = false;

  onFormChange(data: unknown): void {
    this.formData = data;
  }

  onValidChange(valid: boolean): void {
    this.isValid = valid;
  }
}

describe('EquipmentFormComponent', () => {
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

  describe('form rendering', () => {
    it('should render form element', () => {
      const form = fixture.nativeElement.querySelector('form');
      expect(form).toBeTruthy();
    });

    it('should render name field', () => {
      const input = fixture.nativeElement.querySelector('[formcontrolname="name"]');
      expect(input).toBeTruthy();
    });

    it('should render displayName field', () => {
      const input = fixture.nativeElement.querySelector('[formcontrolname="displayName"]');
      expect(input).toBeTruthy();
    });

    it('should render category dropdown', () => {
      const select = fixture.nativeElement.querySelector('[formcontrolname="category"]');
      expect(select).toBeTruthy();
    });

    it('should render imageUrl field', () => {
      const input = fixture.nativeElement.querySelector('[formcontrolname="imageUrl"]');
      expect(input).toBeTruthy();
    });

    it('should render description textarea', () => {
      const textarea = fixture.nativeElement.querySelector('[formcontrolname="description"]');
      expect(textarea).toBeTruthy();
    });
  });

  describe('create mode', () => {
    it('should start with empty name field', () => {
      const nameInput = fixture.nativeElement.querySelector('[formcontrolname="name"] input');
      expect(nameInput).toBeTruthy();
      expect(nameInput.value).toBe('');
    });

    it('should emit invalid state initially', () => {
      expect(component.isValid).toBe(false);
    });
  });

  describe('required field indicators', () => {
    it('should show required indicators for required fields', () => {
      const requiredIndicators = fixture.nativeElement.querySelectorAll('.text-red-500');
      // name, displayName should have required indicators
      expect(requiredIndicators.length).toBeGreaterThanOrEqual(2);
    });
  });
});
