import { Pipe, PipeTransform } from '@angular/core';
import { DropdownOption } from '../../components/ui/inputs/dropdown.component';

@Pipe({
  name: 'valueOptions',
  standalone: true,
})
export class ValueOptionsPipe implements PipeTransform {
  transform(values: (string | number)[]): DropdownOption[] {
    return values.map(value => ({
      value: value.toString(),
      label: value.toString(),
    }));
  }
}
