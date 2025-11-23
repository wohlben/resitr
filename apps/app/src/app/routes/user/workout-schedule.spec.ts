import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkoutScheduleComponent } from './workout-schedule';

describe('WorkoutSchedule', () => {
  let component: WorkoutScheduleComponent;
  let fixture: ComponentFixture<WorkoutScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutScheduleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkoutScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
