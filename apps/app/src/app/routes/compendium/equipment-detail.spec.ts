import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { EquipmentDetail } from './equipment-detail';

describe('EquipmentDetail', () => {
  let component: EquipmentDetail;
  let fixture: ComponentFixture<EquipmentDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquipmentDetail],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => key === 'id' ? 'test-equipment-id' : null
              }
            }
          }
        }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EquipmentDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
