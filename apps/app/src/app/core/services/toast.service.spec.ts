import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ToastService],
    });
    service = TestBed.inject(ToastService);
  });

  afterEach(() => {
    service.clear();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('show', () => {
    it('should add toast to the list', () => {
      service.show('Test message', 'info');

      const toasts = service.toasts$();
      expect(toasts.length).toBe(1);
      expect(toasts[0].message).toBe('Test message');
      expect(toasts[0].type).toBe('info');
    });

    it('should generate unique IDs', () => {
      service.show('Message 1', 'info');
      service.show('Message 2', 'info');

      const toasts = service.toasts$();
      expect(toasts[0].id).not.toBe(toasts[1].id);
    });

    it('should auto-dismiss after duration', fakeAsync(() => {
      service.show('Test message', 'info', 1000);

      expect(service.toasts$().length).toBe(1);

      tick(1000);

      expect(service.toasts$().length).toBe(0);
    }));

    it('should not auto-dismiss when duration is 0', fakeAsync(() => {
      service.show('Persistent message', 'info', 0);

      tick(5000);

      expect(service.toasts$().length).toBe(1);
    }));
  });

  describe('convenience methods', () => {
    it('success should create success toast', () => {
      service.success('Success message');

      const toasts = service.toasts$();
      expect(toasts[0].type).toBe('success');
    });

    it('error should create error toast', () => {
      service.error('Error message');

      const toasts = service.toasts$();
      expect(toasts[0].type).toBe('error');
    });

    it('warning should create warning toast', () => {
      service.warning('Warning message');

      const toasts = service.toasts$();
      expect(toasts[0].type).toBe('warning');
    });

    it('info should create info toast', () => {
      service.info('Info message');

      const toasts = service.toasts$();
      expect(toasts[0].type).toBe('info');
    });
  });

  describe('default durations', () => {
    it('success should use 3000ms default', fakeAsync(() => {
      service.success('Test');

      tick(2999);
      expect(service.toasts$().length).toBe(1);

      tick(1);
      expect(service.toasts$().length).toBe(0);
    }));

    it('error should use 5000ms default', fakeAsync(() => {
      service.error('Test');

      tick(4999);
      expect(service.toasts$().length).toBe(1);

      tick(1);
      expect(service.toasts$().length).toBe(0);
    }));

    it('warning should use 4000ms default', fakeAsync(() => {
      service.warning('Test');

      tick(3999);
      expect(service.toasts$().length).toBe(1);

      tick(1);
      expect(service.toasts$().length).toBe(0);
    }));
  });

  describe('dismiss', () => {
    it('should remove specific toast by ID', () => {
      service.show('Message 1', 'info', 0);
      service.show('Message 2', 'info', 0);

      const toasts = service.toasts$();
      const idToRemove = toasts[0].id;

      service.dismiss(idToRemove);

      expect(service.toasts$().length).toBe(1);
      expect(service.toasts$()[0].message).toBe('Message 2');
    });

    it('should do nothing for non-existent ID', () => {
      service.show('Message', 'info', 0);

      service.dismiss('non-existent-id');

      expect(service.toasts$().length).toBe(1);
    });
  });

  describe('clear', () => {
    it('should remove all toasts', () => {
      service.show('Message 1', 'info', 0);
      service.show('Message 2', 'info', 0);
      service.show('Message 3', 'info', 0);

      service.clear();

      expect(service.toasts$().length).toBe(0);
    });
  });

  describe('multiple toasts', () => {
    it('should handle multiple concurrent toasts', () => {
      service.success('Success');
      service.error('Error');
      service.warning('Warning');
      service.info('Info');

      const toasts = service.toasts$();
      expect(toasts.length).toBe(4);
    });

    it('should maintain order of toasts', () => {
      service.show('First', 'info', 0);
      service.show('Second', 'info', 0);
      service.show('Third', 'info', 0);

      const toasts = service.toasts$();
      expect(toasts[0].message).toBe('First');
      expect(toasts[1].message).toBe('Second');
      expect(toasts[2].message).toBe('Third');
    });
  });
});
