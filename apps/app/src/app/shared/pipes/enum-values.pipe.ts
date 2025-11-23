import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'enumValues',
  standalone: true,
})
export class EnumValuesPipe implements PipeTransform {
  transform<T extends Record<string, string>>(enumObj: T): T[keyof T][] {
    return Object.values(enumObj) as T[keyof T][];
  }
}
