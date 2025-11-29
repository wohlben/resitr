import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { WorkoutsStore } from '../features/workouts/workouts.store';
import { createMockStore } from './provide-mock-store';

describe('provideMockStore Integration', () => {
    it('should create a mock store from the class', () => {
        // Pass the class directly
        const mock = createMockStore(WorkoutsStore);

        // Verify we can access properties
        expect(mock.workouts).toBeDefined();
        expect(mock.loadWorkouts).toBeDefined();

        // Verify they are signals/spies
        expect(mock.workouts.set).toBeDefined();
        expect(mock.loadWorkouts.mock).toBeDefined();

        // Verify we can set values
        mock.workouts.set([]);
        expect(mock.workouts()).toEqual([]);
    });

    it('should support initial state configuration', () => {
        const mock = createMockStore(WorkoutsStore, {
            initialState: { isLoading: true }
        });

        expect(mock.isLoading()).toBe(true);
    });

    it('should be usable in TestBed without providing real store dependencies', () => {
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: WorkoutsStore,
                    useValue: createMockStore(WorkoutsStore, {
                        initialState: { workouts: [] }
                    })
                }
            ]
        });

        // Injecting WorkoutsStore should give us the mock, and NOT fail due to missing HttpClient
        const store = TestBed.inject(WorkoutsStore);

        expect(store.workouts()).toEqual([]);
        expect(store.loadWorkouts).toBeDefined();
        // Verify it's our proxy
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((store.loadWorkouts as any).mock).toBeDefined();
    });
});
