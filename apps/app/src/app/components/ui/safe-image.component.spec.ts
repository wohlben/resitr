import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { SafeImageComponent } from './safe-image.component';

@Component({
  standalone: true,
  imports: [SafeImageComponent],
  template: `
    <app-safe-image
      [src]="src()"
      [alt]="alt()"
      [class]="cssClass()"
    />
  `,
})
class TestHostComponent {
  src = signal<string | null | undefined>(null);
  alt = signal('Test image');
  cssClass = signal('w-32 h-32');
}

describe('SafeImageComponent', () => {
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

  describe('fallback display', () => {
    it('should show fallback when src is null', () => {
      component.src.set(null);
      fixture.detectChanges();

      const fallback = fixture.nativeElement.querySelector('[role="img"]');
      const img = fixture.nativeElement.querySelector('img');

      expect(fallback).toBeTruthy();
      expect(img).toBeNull();
      expect(fallback.textContent).toContain('No image');
    });

    it('should show fallback when src is undefined', () => {
      component.src.set(undefined);
      fixture.detectChanges();

      const fallback = fixture.nativeElement.querySelector('[role="img"]');
      expect(fallback).toBeTruthy();
    });

    it('should show fallback when src is empty string', () => {
      component.src.set('');
      fixture.detectChanges();

      const fallback = fixture.nativeElement.querySelector('[role="img"]');
      expect(fallback).toBeTruthy();
    });
  });

  describe('valid image display', () => {
    it('should show image for valid https URL', () => {
      component.src.set('https://example.com/image.jpg');
      fixture.detectChanges();

      const img = fixture.nativeElement.querySelector('img');
      const fallback = fixture.nativeElement.querySelector('[role="img"]');

      expect(img).toBeTruthy();
      expect(fallback).toBeNull();
    });

    it('should show image for valid http URL', () => {
      component.src.set('http://example.com/image.png');
      fixture.detectChanges();

      const img = fixture.nativeElement.querySelector('img');
      expect(img).toBeTruthy();
    });

    it('should apply alt text to image', () => {
      component.src.set('https://example.com/image.jpg');
      component.alt.set('My custom alt text');
      fixture.detectChanges();

      const img = fixture.nativeElement.querySelector('img');
      expect(img.alt).toBe('My custom alt text');
    });

    it('should apply CSS class to image', () => {
      component.src.set('https://example.com/image.jpg');
      component.cssClass.set('rounded-lg shadow-md');
      fixture.detectChanges();

      const img = fixture.nativeElement.querySelector('img');
      expect(img.className).toContain('rounded-lg');
      expect(img.className).toContain('shadow-md');
    });
  });

  describe('XSS prevention', () => {
    it('should reject javascript: protocol', () => {
      component.src.set('javascript:alert("xss")');
      fixture.detectChanges();

      const img = fixture.nativeElement.querySelector('img');
      const fallback = fixture.nativeElement.querySelector('[role="img"]');

      expect(img).toBeNull();
      expect(fallback).toBeTruthy();
    });

    it('should reject data: URLs', () => {
      component.src.set('data:text/html,<script>alert("xss")</script>');
      fixture.detectChanges();

      const img = fixture.nativeElement.querySelector('img');
      expect(img).toBeNull();
    });
  });

  describe('accessibility', () => {
    it('should have aria-label on fallback from alt prop', () => {
      component.src.set(null);
      component.alt.set('Product image');
      fixture.detectChanges();

      const fallback = fixture.nativeElement.querySelector('[role="img"]');
      expect(fallback.getAttribute('aria-label')).toBe('Product image');
    });

    it('should have default aria-label when alt is empty', () => {
      component.src.set(null);
      component.alt.set('');
      fixture.detectChanges();

      const fallback = fixture.nativeElement.querySelector('[role="img"]');
      expect(fallback.getAttribute('aria-label')).toBe('No image available');
    });

    it('should apply custom class to fallback div', () => {
      component.src.set(null);
      component.cssClass.set('w-48 h-48');
      fixture.detectChanges();

      const fallback = fixture.nativeElement.querySelector('[role="img"]');
      expect(fallback.className).toContain('w-48');
      expect(fallback.className).toContain('h-48');
    });
  });
});
