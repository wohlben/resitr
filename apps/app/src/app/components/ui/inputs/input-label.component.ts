import { Component, input } from '@angular/core';

@Component({
  selector: 'app-input-label',
  standalone: true,
  template: `
    <div [class]="class()">
      {{ text() }}
      @if (required()) {
        <span class="text-red-500">*</span>
      }
    </div>
  `,
})
export class InputLabelComponent {
  text = input.required<string>();
  required = input<boolean>(false);
  class = input<string>('block text-sm font-medium text-gray-700 mb-1');
}
