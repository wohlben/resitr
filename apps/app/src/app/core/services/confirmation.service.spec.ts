import { TestBed } from '@angular/core/testing';
import { ConfirmationService } from './confirmation.service';

describe('ConfirmationService', () => {
  let service: ConfirmationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConfirmationService],
    });
    service = TestBed.inject(ConfirmationService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('should be closed initially', () => {
      expect(service.isOpen()).toBe(false);
    });

    it('should have default values', () => {
      expect(service.title()).toBe('');
      expect(service.message()).toBe('');
      expect(service.confirmText()).toBe('Confirm');
      expect(service.cancelText()).toBe('Cancel');
      expect(service.isDestructive()).toBe(false);
      expect(service.changes()).toEqual([]);
    });
  });

  describe('confirm', () => {
    it('should open the dialog', () => {
      service.confirm({
        title: 'Test Title',
        message: 'Test Message',
      });

      expect(service.isOpen()).toBe(true);
    });

    it('should set title and message', () => {
      service.confirm({
        title: 'Test Title',
        message: 'Test Message',
      });

      expect(service.title()).toBe('Test Title');
      expect(service.message()).toBe('Test Message');
    });

    it('should set custom button text', () => {
      service.confirm({
        title: 'Title',
        message: 'Message',
        confirmText: 'Yes, Do It',
        cancelText: 'No, Cancel',
      });

      expect(service.confirmText()).toBe('Yes, Do It');
      expect(service.cancelText()).toBe('No, Cancel');
    });

    it('should set isDestructive', () => {
      service.confirm({
        title: 'Title',
        message: 'Message',
        isDestructive: true,
      });

      expect(service.isDestructive()).toBe(true);
    });

    it('should use default button text when not provided', () => {
      service.confirm({
        title: 'Title',
        message: 'Message',
      });

      expect(service.confirmText()).toBe('Confirm');
      expect(service.cancelText()).toBe('Cancel');
    });

    it('should return a Promise', () => {
      const result = service.confirm({
        title: 'Title',
        message: 'Message',
      });

      expect(result).toBeInstanceOf(Promise);
    });

    it('should set changes when provided', () => {
      const changes = [
        { field: 'Name', oldValue: 'Old', newValue: 'New' },
        { field: 'Description', oldValue: '', newValue: 'Added' },
      ];

      service.confirm({
        title: 'Title',
        message: 'Message',
        changes,
      });

      expect(service.changes()).toEqual(changes);
    });

    it('should default to empty changes when not provided', () => {
      service.confirm({
        title: 'Title',
        message: 'Message',
      });

      expect(service.changes()).toEqual([]);
    });

    it('should clear changes from previous confirmation', () => {
      service.confirm({
        title: 'First',
        message: 'Message',
        changes: [{ field: 'Name', oldValue: 'A', newValue: 'B' }],
      });
      service.cancel();

      service.confirm({
        title: 'Second',
        message: 'Message',
      });

      expect(service.changes()).toEqual([]);
    });
  });

  describe('accept', () => {
    it('should close the dialog', async () => {
      const promise = service.confirm({
        title: 'Title',
        message: 'Message',
      });

      service.accept();

      expect(service.isOpen()).toBe(false);
      await expect(promise).resolves.toBe(true);
    });

    it('should resolve promise with true', async () => {
      const promise = service.confirm({
        title: 'Title',
        message: 'Message',
      });

      service.accept();

      const result = await promise;
      expect(result).toBe(true);
    });
  });

  describe('cancel', () => {
    it('should close the dialog', async () => {
      const promise = service.confirm({
        title: 'Title',
        message: 'Message',
      });

      service.cancel();

      expect(service.isOpen()).toBe(false);
      await expect(promise).resolves.toBe(false);
    });

    it('should resolve promise with false', async () => {
      const promise = service.confirm({
        title: 'Title',
        message: 'Message',
      });

      service.cancel();

      const result = await promise;
      expect(result).toBe(false);
    });
  });

  describe('multiple confirmations', () => {
    it('should handle sequential confirmations', async () => {
      // First confirmation - accept
      const promise1 = service.confirm({
        title: 'First',
        message: 'First message',
      });
      service.accept();
      const result1 = await promise1;
      expect(result1).toBe(true);

      // Second confirmation - cancel
      const promise2 = service.confirm({
        title: 'Second',
        message: 'Second message',
      });
      service.cancel();
      const result2 = await promise2;
      expect(result2).toBe(false);
    });

    it('should update state for new confirmation', () => {
      service.confirm({
        title: 'First',
        message: 'First message',
      });
      service.cancel();

      service.confirm({
        title: 'Second',
        message: 'Second message',
        isDestructive: true,
      });

      expect(service.title()).toBe('Second');
      expect(service.message()).toBe('Second message');
      expect(service.isDestructive()).toBe(true);
    });
  });
});
