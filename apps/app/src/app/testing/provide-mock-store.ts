import { Provider, signal, Signal, WritableSignal } from '@angular/core';
import { vi, type Mock } from 'vitest';


export interface MockStoreConfig<TState = Record<string, unknown>, TComputed = Record<string, unknown>> {

  initialState?: Partial<TState>;

  computedDefaults?: Partial<TComputed>;
}


export type MockStore<T> = {
  [K in keyof T]: T[K] extends Signal<infer V>
  ? WritableSignal<V>
  : T[K] extends (...args: infer Args) => infer Return
  ? Mock<(...args: Args) => Return>
  : T[K];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Type<T> = new (...args: any[]) => T;


export function createMockStore<TStore extends object>(
  store: Type<TStore>,
  config?: MockStoreConfig
): MockStore<TStore & Record<string, unknown>> {
  const { initialState = {}, computedDefaults = {} } = config || {};
  const cache = new Map<string | symbol, unknown>();

  // Create a proxy to intercept property access
  // We use the prototype of the class if available, or just an empty object
  // casting to TStore to satisfy the Proxy type requirements
  const target = store.prototype || {};

  const proxy = new Proxy(target as TStore, {
    get(_target, prop) {
      // Return cached value if it exists
      if (cache.has(prop)) {
        return cache.get(prop);
      }

      // Handle special properties that shouldn't be mocked
      if (prop === 'then' || prop === 'catch' || prop === 'finally' || prop === Symbol.iterator) {
        return undefined;
      }

      // Check if we have an initial value for this property
      let initialValue: unknown = undefined;
      const propStr = String(prop);

      if (propStr in initialState) {
        initialValue = initialState[propStr as keyof typeof initialState];
      } else if (propStr in computedDefaults) {
        initialValue = computedDefaults[propStr as keyof typeof computedDefaults];
      }

      // Create a mock signal that also acts as a spy
      // This covers both signals (which are functions) and methods (which are functions)
      // We make it a writable signal by default so it can be set in tests
      const mockSignal = signal(initialValue);

      // Create a spy that calls the signal getter by default
      // This allows it to be used as a method spy OR a signal getter
      const mockFn = vi.fn((...args: unknown[]) => {
        if (args.length > 0) {
          // It's being called as a method
          return undefined;
        }
        // It's being called as a signal getter
        return mockSignal();
      });

      // Attach signal methods to the spy so it looks like a WritableSignal
      Object.assign(mockFn, {
        set: mockSignal.set.bind(mockSignal),
        update: mockSignal.update.bind(mockSignal),
        asReadonly: mockSignal.asReadonly.bind(mockSignal),
        // Add a way to identify it as a signal for debugging
        [Symbol.toStringTag]: 'Signal',
      });

      cache.set(prop, mockFn);
      return mockFn;
    },
  });

  return proxy as MockStore<TStore & Record<string, unknown>>;
}

export function provideMockStore<TStore extends object>(
  store: Type<TStore>,
  config?: MockStoreConfig
): Provider {
  return { provide: store, useValue: createMockStore(store, config) };
}