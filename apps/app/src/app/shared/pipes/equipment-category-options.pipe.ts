import { Pipe, PipeTransform } from '@angular/core';
import { EquipmentCategory } from '@resitr/api';
import { DropdownOption } from '../../components/ui/inputs/dropdown.component';

@Pipe({
  name: 'equipmentCategoryOptions',
  standalone: true,
})
export class EquipmentCategoryOptionsPipe implements PipeTransform {
  transform(categories: EquipmentCategory[]): DropdownOption[] {
    const labels: Record<EquipmentCategory, string> = {
      [EquipmentCategory.accessories]: 'Accessories',
      [EquipmentCategory.benches]: 'Benches',
      [EquipmentCategory.free_weights]: 'Free Weights',
      [EquipmentCategory.functional]: 'Functional',
      [EquipmentCategory.machines]: 'Machines',
      [EquipmentCategory.other]: 'Other',
    };

    return categories.map((category) => ({
      value: category,
      label: labels[category] || category,
    }));
  }
}
