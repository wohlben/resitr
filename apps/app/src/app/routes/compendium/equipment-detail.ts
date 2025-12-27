import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EquipmentsStore } from '../../features/equipments/equipments.store';
import { LoadingComponent } from '../../components/ui/feedback/loading.component';
import { ErrorLoadingComponent } from '../../components/ui/feedback/error-loading.component';
import { SafeImageComponent } from '../../components/ui/display/safe-image.component';
import { DetailPageHeaderComponent } from '../../components/ui/display/detail-page-header.component';
import { DetailFieldComponent } from '../../components/ui/display/detail-field.component';
import { TagListComponent } from '../../components/ui/display/tag-list.component';
import { ButtonComponent } from '../../components/ui/buttons/button.component';
import { ValueLabelPipe } from '../../shared/pipes/value-label.pipe';
import { EquipmentCategoryLabels } from '@resitr/api';

@Component({
  selector: 'app-equipment-detail',
  standalone: true,
  imports: [
    LoadingComponent,
    ErrorLoadingComponent,
    SafeImageComponent,
    DetailPageHeaderComponent,
    DetailFieldComponent,
    TagListComponent,
    ButtonComponent,
    ValueLabelPipe,
  ],
  template: `
    @if (store.isLoading()) {
      <app-loading message="Loading equipment..." />
    } @else if (store.error()) {
      <app-error-loading
        title="Error loading equipment"
        [message]="store.error()!"
      />
    } @else if (store.currentEquipment(); as equipment) {
      <div class="max-w-4xl mx-auto space-y-6">
        <app-detail-page-header
          [title]="equipment.displayName"
          [subtitle]="equipment.name"
          backLink="/compendium/equipments"
        >
          <app-button header-primary-action variant="primary" [link]="['/compendium/equipments', equipment.templateId, 'edit']">
            Edit Equipment
          </app-button>
        </app-detail-page-header>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200">
          @if (equipment.imageUrl) {
            <div class="aspect-video w-full bg-gray-100 rounded-t-lg overflow-hidden">
              <app-safe-image
                [src]="equipment.imageUrl"
                [alt]="equipment.displayName"
                class="w-full h-full object-cover"
              />
            </div>
          }

          <div class="p-6 space-y-6">
            @if (equipment.category) {
              <app-detail-field
                label="Category"
                [value]="equipment.category | valueLabel:EquipmentCategoryLabels"
              />
            }

            @if (equipment.description) {
              <div>
                <h3 class="text-sm font-medium text-gray-500">Description</h3>
                <p class="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                  {{ equipment.description }}
                </p>
              </div>
            }

            <app-tag-list
              label="Substitutes For"
              [items]="equipment.substitutesFor || []"
              [mono]="true"
            />
          </div>
        </div>
      </div>
    }
  `,
})
export class EquipmentDetail {
  store = inject(EquipmentsStore);
  private route = inject(ActivatedRoute);

  readonly EquipmentCategoryLabels = EquipmentCategoryLabels;

  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed())
      .subscribe((params) => {
        const id = params.get('id');
        if (id) {
          this.store.loadEquipment(id);
        }
      });
  }
}
