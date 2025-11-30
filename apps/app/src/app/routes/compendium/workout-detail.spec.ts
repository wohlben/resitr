import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { WorkoutDetail } from './workout-detail';
import { WorkoutsStore } from '../../features/workouts/workouts.store';
import { ExercisesStore } from '../../features/exercises/exercises.store';
import { provideMockStore } from '../../testing/provide-mock-store';

describe('WorkoutDetail', () => {
  let component: WorkoutDetail;
  let fixture: ComponentFixture<WorkoutDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutDetail, RouterModule.forRoot([])],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: (key: string) => key === 'id' ? 'test-workout-id' : null }),
          },
        },
      ],
    })
      .overrideComponent(WorkoutDetail, {
        set: {
          providers: [
            provideMockStore(WorkoutsStore, {
              initialState: {
                currentWorkout: null,
                isLoading: false,
                error: null,
              },
            }),
            provideMockStore(ExercisesStore, {
              initialState: {
                exercises: [],
              },
            }),
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(WorkoutDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
