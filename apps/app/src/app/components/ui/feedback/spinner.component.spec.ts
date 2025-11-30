import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { SpinnerComponent } from './spinner.component';

@Component({
  standalone: true,
  imports: [SpinnerComponent],
  template: `
    <app-spinner [size]="size()" [ariaLabel]="ariaLabel()" />
  `,
})
class TestHostComponent {
  size = signal<'small' | 'medium' | 'large'>('small');
  ariaLabel = signal('Loading');
}

describe('SpinnerComponent', () => {
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

  describe('size variants', () => {
    it('should apply small size classes', () => {
      component.size.set('small');
      fixture.detectChanges();

      const svg = fixture.nativeElement.querySelector('svg');
      expect(svg.classList.contains('h-4')).toBe(true);
      expect(svg.classList.contains('w-4')).toBe(true);
    });

    it('should apply medium size classes', () => {
      component.size.set('medium');
      fixture.detectChanges();

      const svg = fixture.nativeElement.querySelector('svg');
      expect(svg.classList.contains('h-6')).toBe(true);
      expect(svg.classList.contains('w-6')).toBe(true);
    });

    it('should apply large size classes', () => {
      component.size.set('large');
      fixture.detectChanges();

      const svg = fixture.nativeElement.querySelector('svg');
      expect(svg.classList.contains('h-8')).toBe(true);
      expect(svg.classList.contains('w-8')).toBe(true);
    });
  });

  describe('accessibility', () => {
    it('should have role=status', () => {
      const svg = fixture.nativeElement.querySelector('svg');
      expect(svg.getAttribute('role')).toBe('status');
    });

    it('should have default aria-label', () => {
      const svg = fixture.nativeElement.querySelector('svg');
      expect(svg.getAttribute('aria-label')).toBe('Loading');
    });

    it('should use custom aria-label', () => {
      component.ariaLabel.set('Processing data');
      fixture.detectChanges();

      const svg = fixture.nativeElement.querySelector('svg');
      expect(svg.getAttribute('aria-label')).toBe('Processing data');
    });
  });

  describe('animation', () => {
    it('should have animate-spin class', () => {
      const svg = fixture.nativeElement.querySelector('svg');
      expect(svg.classList.contains('animate-spin')).toBe(true);
    });
  });

  describe('SVG structure', () => {
    it('should contain circle element', () => {
      const circle = fixture.nativeElement.querySelector('circle');
      expect(circle).toBeTruthy();
    });

    it('should contain path element', () => {
      const path = fixture.nativeElement.querySelector('path');
      expect(path).toBeTruthy();
    });
  });
});
