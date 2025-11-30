import { Component, input } from '@angular/core';

@Component({
  selector: 'app-input-hint',
  standalone: true,
  template: `
    @if (text()) {
      <span [id]="id()" class="text-xs text-gray-500">{{ text() }}</span>
    }
  `,
})
export class InputHintComponent {
  text = input<string>('');
  id = input<string>('');
}
