import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExerciseGroupsComponent } from './exercise-groups';

describe('ExerciseGroups', () => {
  let component: ExerciseGroupsComponent;
  let fixture: ComponentFixture<ExerciseGroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExerciseGroupsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExerciseGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
