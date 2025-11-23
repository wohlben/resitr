import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExerciseGroupDetail } from './exercise-group-detail';

describe('ExerciseGroupDetail', () => {
  let component: ExerciseGroupDetail;
  let fixture: ComponentFixture<ExerciseGroupDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExerciseGroupDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(ExerciseGroupDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
