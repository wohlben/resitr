import { Pipe, PipeTransform } from '@angular/core';
import { EquipmentCategory } from '@resitr/api';

@Pipe({
  name: 'equipmentCategoryLabel',
  standalone: true,
})
export class EquipmentCategoryLabelPipe implements PipeTransform {
  transform(value: EquipmentCategory | undefined): string {
    if (!value) return 'Uncategorized';

    switch (value) {
      case EquipmentCategory.accessories:
        return 'Accessories';
      case EquipmentCategory.benches:
        return 'Benches';
      case EquipmentCategory.free_weights:
        return 'Free Weights';
      case EquipmentCategory.functional:
        return 'Functional';
      case EquipmentCategory.machines:
        return 'Machines';
      case EquipmentCategory.other:
        return 'Other';
      default:
        return 'Uncategorized';
    }
  }
}
