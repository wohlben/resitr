import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExercisesComponent } from './exercises';
import { ExercisesStore } from '../../features/exercises/exercises.store';
import { provideMockStore } from '../../testing/provide-mock-store';
import { RouterModule } from '@angular/router';

describe('Exercises', () => {
  let component: ExercisesComponent;
  let fixture: ComponentFixture<ExercisesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExercisesComponent, RouterModule.forRoot([])],
    })
      .overrideComponent(ExercisesComponent, {
        set: {
          providers: [
            provideMockStore(ExercisesStore, {
              initialState: {
                filteredExercises: [],
              },
            }),
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ExercisesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
