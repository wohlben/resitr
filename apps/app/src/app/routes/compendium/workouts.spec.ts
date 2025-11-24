import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkoutsComponent } from './workouts';
import { WorkoutsStore } from '../../features/workouts/workouts.store';
import {  RouterModule } from '@angular/router';
import { provideMockStore } from '../../testing/provide-mock-store';

describe('Workouts', () => {
  let component: WorkoutsComponent;
  let fixture: ComponentFixture<WorkoutsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutsComponent, RouterModule.forRoot([])],
    })
      .overrideComponent(WorkoutsComponent, {
        set: {
          providers: [
            provideMockStore(WorkoutsStore, {
              initialState: {
                filteredWorkouts: [],
              },
            }),
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(WorkoutsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
