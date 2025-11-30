import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ExerciseGroupDetail } from './exercise-group-detail';

describe('ExerciseGroupDetail', () => {
  let component: ExerciseGroupDetail;
  let fixture: ComponentFixture<ExerciseGroupDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExerciseGroupDetail, RouterModule.forRoot([])],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: (key: string) => key === 'id' ? 'test-group-id' : null }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExerciseGroupDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
