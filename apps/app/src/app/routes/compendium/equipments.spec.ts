import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EquipmentsComponent } from './equipments';
import { EquipmentsStore } from '../../features/equipments/equipments.store';
import { provideMockStore } from '../../testing/provide-mock-store';
import { RouterModule } from '@angular/router';

describe('Equipments', () => {
  let component: EquipmentsComponent;
  let fixture: ComponentFixture<EquipmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquipmentsComponent, RouterModule.forRoot([])],
    })
      .overrideComponent(EquipmentsComponent, {
        set: {
          providers: [
            provideMockStore(EquipmentsStore, {
              initialState: {
                filteredEquipments: [],
              },
            }),
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(EquipmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
