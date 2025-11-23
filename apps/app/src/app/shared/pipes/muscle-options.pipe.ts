import { Pipe, PipeTransform } from '@angular/core';
import { Muscle, MuscleLabels } from '@resitr/api';
import { DropdownOption } from '../../components/ui/inputs/dropdown.component';

@Pipe({
  name: 'muscleOptions',
  standalone: true,
})
export class MuscleOptionsPipe implements PipeTransform {
  transform(muscles: Muscle[]): DropdownOption[] {
    return muscles.map(muscle => ({
      value: muscle,
      label: MuscleLabels[muscle] || muscle,
    }));
  }
}
