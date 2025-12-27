import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastComponent } from './toast.component';
import { ToastService } from '../../../core/services/toast.service';

describe('ToastComponent', () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;
  let toastService: ToastService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastComponent],
      providers: [ToastService],
    }).compileComponents();

    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    toastService = TestBed.inject(ToastService);
    fixture.detectChanges();
  });

  afterEach(() => {
    toastService.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('toast rendering', () => {
    it('should render no toasts initially', () => {
      const toasts = fixture.nativeElement.querySelectorAll('[role="alert"]');
      expect(toasts.length).toBe(0);
    });

    it('should render toast when added', () => {
      toastService.show('Test message', 'info', 0);
      fixture.detectChanges();

      const toast = fixture.nativeElement.querySelector('[role="alert"]');
      expect(toast).toBeTruthy();
      expect(toast.textContent).toContain('Test message');
    });

    it('should render multiple toasts', () => {
      toastService.show('Message 1', 'info', 0);
      toastService.show('Message 2', 'success', 0);
      toastService.show('Message 3', 'error', 0);
      fixture.detectChanges();

      const toasts = fixture.nativeElement.querySelectorAll('[role="alert"]');
      expect(toasts.length).toBe(3);
    });
  });

  describe('toast types', () => {
    it('should apply success styling', () => {
      toastService.success('Success message', 0);
      fixture.detectChanges();

      const toast = fixture.nativeElement.querySelector('[role="alert"]');
      expect(toast.className).toContain('bg-green-50');
      expect(toast.className).toContain('text-green-800');
    });

    it('should apply error styling', () => {
      toastService.error('Error message', 0);
      fixture.detectChanges();

      const toast = fixture.nativeElement.querySelector('[role="alert"]');
      expect(toast.className).toContain('bg-red-50');
      expect(toast.className).toContain('text-red-800');
    });

    it('should apply warning styling', () => {
      toastService.warning('Warning message', 0);
      fixture.detectChanges();

      const toast = fixture.nativeElement.querySelector('[role="alert"]');
      expect(toast.className).toContain('bg-yellow-50');
      expect(toast.className).toContain('text-yellow-800');
    });

    it('should apply info styling', () => {
      toastService.info('Info message', 0);
      fixture.detectChanges();

      const toast = fixture.nativeElement.querySelector('[role="alert"]');
      expect(toast.className).toContain('bg-blue-50');
      expect(toast.className).toContain('text-blue-800');
    });
  });

  describe('dismiss functionality', () => {
    it('should have dismiss button', () => {
      toastService.show('Test', 'info', 0);
      fixture.detectChanges();

      const dismissButton = fixture.nativeElement.querySelector(
        '[aria-label="Dismiss info notification"]'
      );
      expect(dismissButton).toBeTruthy();
    });

    it('should dismiss toast when clicking close button', () => {
      toastService.show('Test', 'info', 0);
      fixture.detectChanges();

      const dismissButton = fixture.nativeElement.querySelector(
        '[aria-label="Dismiss info notification"]'
      );
      dismissButton.click();

      // Verify service state was updated
      expect(toastService.toasts$().length).toBe(0);
    });
  });

  describe('accessibility', () => {
    it('should have region role on container', () => {
      const container = fixture.nativeElement.querySelector('[role="region"]');
      expect(container).toBeTruthy();
    });

    it('should have aria-label on container', () => {
      const container = fixture.nativeElement.querySelector('[aria-label="Notifications"]');
      expect(container).toBeTruthy();
    });

    it('should have aria-live=polite', () => {
      const container = fixture.nativeElement.querySelector('[aria-live="polite"]');
      expect(container).toBeTruthy();
    });

    it('should have aria-labelledby on toast', () => {
      toastService.show('Test', 'info', 0);
      fixture.detectChanges();

      const toast = fixture.nativeElement.querySelector('[role="alert"]');
      expect(toast.getAttribute('aria-labelledby')).toBeTruthy();
    });
  });

  describe('icons', () => {
    it('should show success icon for success toast', () => {
      toastService.success('Success', 0);
      fixture.detectChanges();

      const svg = fixture.nativeElement.querySelector('svg[aria-hidden="true"]');
      expect(svg).toBeTruthy();
    });

    it('should show error icon for error toast', () => {
      toastService.error('Error', 0);
      fixture.detectChanges();

      const svg = fixture.nativeElement.querySelector('svg[aria-hidden="true"]');
      expect(svg).toBeTruthy();
    });
  });

  describe('getToastClasses', () => {
    it('should return correct classes for success type', () => {
      const classes = component.getToastClasses('success');
      expect(classes).toContain('bg-green-50');
      expect(classes).toContain('border-green-200');
      expect(classes).toContain('text-green-800');
    });

    it('should return correct classes for error type', () => {
      const classes = component.getToastClasses('error');
      expect(classes).toContain('bg-red-50');
      expect(classes).toContain('border-red-200');
      expect(classes).toContain('text-red-800');
    });

    it('should return correct classes for warning type', () => {
      const classes = component.getToastClasses('warning');
      expect(classes).toContain('bg-yellow-50');
      expect(classes).toContain('border-yellow-200');
      expect(classes).toContain('text-yellow-800');
    });

    it('should return correct classes for info type', () => {
      const classes = component.getToastClasses('info');
      expect(classes).toContain('bg-blue-50');
      expect(classes).toContain('border-blue-200');
      expect(classes).toContain('text-blue-800');
    });

    it('should fallback to info for unknown type', () => {
      const classes = component.getToastClasses('unknown');
      expect(classes).toContain('bg-blue-50');
    });
  });
});
