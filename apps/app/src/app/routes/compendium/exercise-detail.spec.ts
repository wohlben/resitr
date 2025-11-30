import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ExerciseDetail } from './exercise-detail';

describe('ExerciseDetail', () => {
  let component: ExerciseDetail;
  let fixture: ComponentFixture<ExerciseDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExerciseDetail],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: (key: string) => key === 'id' ? 'test-exercise-id' : null }),
            snapshot: {
              paramMap: {
                get: (key: string) => key === 'id' ? 'test-exercise-id' : null
              }
            }
          }
        }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExerciseDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
