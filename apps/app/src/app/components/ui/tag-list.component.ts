import { Component, input, computed } from '@angular/core';

export type TagColor = 'gray' | 'blue' | 'green' | 'red' | 'yellow' | 'purple';

const COLOR_CLASSES: Record<TagColor, string> = {
  gray: 'bg-gray-100 text-gray-700',
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  purple: 'bg-purple-100 text-purple-700',
};

@Component({
  selector: 'app-tag-list',
  standalone: true,
  template: `
    @if (displayItems().length > 0) {
      <div>
        @if (label()) {
          <h3 class="text-sm font-medium text-gray-500 mb-2">{{ label() }}</h3>
        }
        <div class="flex flex-wrap gap-2">
          @for (item of displayItems(); track item) {
            <span
              class="px-3 py-1 text-xs font-medium rounded-full"
              [class]="colorClasses()"
              [class.font-mono]="mono()"
            >
              {{ item }}
            </span>
          }
        </div>
      </div>
    }
  `,
})
export class TagListComponent {
  label = input<string>();
  items = input.required<string[]>();
  labels = input<Record<string, string>>();
  color = input<TagColor>('gray');
  mono = input<boolean>(false);

  displayItems = computed(() => {
    const labelMap = this.labels();
    if (!labelMap) return this.items();
    return this.items().map(item => labelMap[item] || item);
  });

  colorClasses = computed(() => COLOR_CLASSES[this.color()]);
}
