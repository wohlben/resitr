import { Pipe, PipeTransform } from '@angular/core';
import { TechnicalDifficulty, TechnicalDifficultyLabels } from '@resitr/api';

@Pipe({
  name: 'difficultyLabel',
  standalone: true,
})
export class DifficultyLabelPipe implements PipeTransform {
  transform(difficulty: TechnicalDifficulty): string {
    return TechnicalDifficultyLabels[difficulty] || difficulty;
  }
}
