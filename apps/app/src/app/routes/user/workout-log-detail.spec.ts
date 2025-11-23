import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkoutLogDetail } from './workout-log-detail';

describe('WorkoutLogDetail', () => {
  let component: WorkoutLogDetail;
  let fixture: ComponentFixture<WorkoutLogDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutLogDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkoutLogDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
