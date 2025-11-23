import { Pipe, PipeTransform } from '@angular/core';
import { Muscle, MuscleLabels } from '@resitr/api';

@Pipe({
  name: 'muscleLabel',
  standalone: true,
})
export class MuscleLabelPipe implements PipeTransform {
  transform(muscle: Muscle): string {
    return MuscleLabels[muscle] || muscle;
  }
}
