import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'valueLabel',
  standalone: true,
})
export class ValueLabelPipe implements PipeTransform {
  transform(value: string | undefined, labels: Record<string, string>, fallback = 'Unknown'): string {
    if (!value) return fallback;
    return labels[value] || value;
  }
}
