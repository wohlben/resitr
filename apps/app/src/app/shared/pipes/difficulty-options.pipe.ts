import { Pipe, PipeTransform } from '@angular/core';
import { TechnicalDifficulty, TechnicalDifficultyLabels } from '@resitr/api';
import { DropdownOption } from '../../components/ui/inputs/dropdown.component';

@Pipe({
  name: 'difficultyOptions',
  standalone: true,
})
export class DifficultyOptionsPipe implements PipeTransform {
  transform(difficulties: TechnicalDifficulty[]): DropdownOption[] {
    return difficulties.map(difficulty => ({
      value: difficulty,
      label: TechnicalDifficultyLabels[difficulty] || difficulty,
    }));
  }
}
