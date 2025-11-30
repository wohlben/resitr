import { Component, input } from '@angular/core';

@Component({
  selector: 'app-input-error',
  standalone: true,
  template: `
    @if (text()) {
      <span [id]="id()" class="text-xs text-red-600" role="alert">{{ text() }}</span>
    }
  `,
})
export class InputErrorComponent {
  text = input<string>('');
  id = input<string>('');
}
