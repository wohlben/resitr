import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkoutScheduleDetail } from './workout-schedule-detail';

describe('WorkoutScheduleDetail', () => {
  let component: WorkoutScheduleDetail;
  let fixture: ComponentFixture<WorkoutScheduleDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutScheduleDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkoutScheduleDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
