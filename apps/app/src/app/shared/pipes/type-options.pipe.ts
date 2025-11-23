import { Pipe, PipeTransform } from '@angular/core';
import { ExerciseType, ExerciseTypeLabels } from '@resitr/api';
import { DropdownOption } from '../../components/ui/inputs/dropdown.component';

@Pipe({
  name: 'typeOptions',
  standalone: true,
})
export class TypeOptionsPipe implements PipeTransform {
  transform(types: ExerciseType[]): DropdownOption[] {
    return types.map(type => ({
      value: type,
      label: ExerciseTypeLabels[type] || type,
    }));
  }
}
