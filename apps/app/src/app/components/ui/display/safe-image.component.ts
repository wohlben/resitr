import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { sanitizeImageUrl } from '../../../shared/utils/sanitization';

@Component({
  selector: 'app-safe-image',
  standalone: true,
  template: `
    @if (safeUrl()) {
      <img [src]="safeUrl()!" [alt]="alt()" [class]="class()" />
    } @else {
      <div
        [class]="class() + ' bg-gray-200 flex items-center justify-center'"
        role="img"
        [attr.aria-label]="alt() || 'No image available'"
      >
        <span class="text-gray-500 text-sm">No image</span>
      </div>
    }
  `,
})
export class SafeImageComponent {
  src = input<string | null | undefined>(null);
  alt = input<string>('');
  class = input<string>('');

  private sanitizer = inject(DomSanitizer);

  safeUrl = computed(() => {
    const url = this.src();
    return url ? sanitizeImageUrl(this.sanitizer, url) : null;
  });
}
