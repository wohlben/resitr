import { Pipe, PipeTransform } from '@angular/core';
import type { ExerciseType } from '@resitr/api';

@Pipe({
  name: 'exerciseType',
  standalone: true,
})
export class ExerciseTypePipe implements PipeTransform {
  transform(type: ExerciseType): string {
    return type.charAt(0) + type.slice(1).toLowerCase();
  }
}
