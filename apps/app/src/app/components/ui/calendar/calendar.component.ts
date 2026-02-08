import { Component, computed, input, output, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

export interface CalendarEntry {
  on: Date;
  type: string;
  name: string;
}

export interface CalendarLegend {
  [key: string]: string;
}

interface CalendarDay {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  entries: CalendarEntry[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <!-- Calendar Header -->
      <div class="flex items-center justify-between mb-4">
        <button class="p-1 hover:bg-gray-100 rounded" (click)="previousMonth()">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 class="font-semibold text-gray-900">
          {{ currentMonth() | date : 'MMMM yyyy' }}
        </h3>
        <button class="p-1 hover:bg-gray-100 rounded" (click)="nextMonth()">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <!-- Calendar Grid -->
      <div class="grid grid-cols-7 gap-1">
        <!-- Weekday headers -->
        @for (day of ['S', 'M', 'T', 'W', 'T', 'F', 'S']; track $index) {
        <div class="text-center text-xs font-medium text-gray-500 py-1">
          {{ day }}
        </div>
        }

        <!-- Calendar days -->
        @for (day of calendarDays(); track day.date.getTime()) {
        <div
          class="aspect-square p-1 text-sm rounded cursor-pointer hover:bg-gray-100 transition-colors relative"
          [class.bg-gray-50]="!day.isCurrentMonth"
          [class.font-semibold]="isToday(day.date)"
          [class.ring-2]="isToday(day.date)"
          [class.ring-blue-500]="isToday(day.date)"
          (click)="onDayClick(day.date)"
          (keydown.enter)="onDayClick(day.date)"
          (keydown.space)="onDayClick(day.date)"
          tabindex="0"
          role="button"
          [attr.aria-label]="day.date | date : 'fullDate'"
        >
          <span [class.text-gray-400]="!day.isCurrentMonth">{{ day.dayOfMonth }}</span>

          <!-- Entry dots -->
          @if (day.entries.length > 0) {
          <div class="absolute bottom-1 left-1 right-1 flex justify-center gap-0.5 flex-wrap">
            @for (entry of day.entries.slice(0, maxDots()); track entry.name) {
            <div class="w-1.5 h-1.5 rounded-full" [class]="getDotColorClass(entry.type)"></div>
            } @if (day.entries.length > maxDots()) {
            <div class="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
            }
          </div>
          }
        </div>
        }
      </div>

      <!-- Dynamic Legend -->
      @if (hasLegendEntries()) {
      <div class="mt-4 pt-4 border-t border-gray-200 space-y-2">
        @for (type of legendTypes(); track type) {
        <div class="flex items-center gap-2 text-xs">
          <div class="w-3 h-3 rounded-full" [class]="getDotColorClass(type)"></div>
          <span class="text-gray-600">{{ legend()[type] }}</span>
        </div>
        }
      </div>
      }
    </div>
  `,
})
export class CalendarComponent {
  entries = input<CalendarEntry[]>([]);
  legend = input<CalendarLegend>({});
  maxDots = input<number>(3);

  dayClick = output<Date>();

  readonly currentMonth = signal(new Date());

  readonly entriesByDate = computed(() => {
    const map = new Map<string, CalendarEntry[]>();
    for (const entry of this.entries()) {
      const dateKey = entry.on.toDateString();
      const existing = map.get(dateKey) ?? [];
      existing.push(entry);
      map.set(dateKey, existing);
    }
    return map;
  });

  readonly calendarDays = computed(() => {
    const year = this.currentMonth().getFullYear();
    const month = this.currentMonth().getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());

    const days: CalendarDay[] = [];
    const currentDate = new Date(startDate);

    // Generate 6 weeks (42 days) to ensure we cover the full month view
    for (let i = 0; i < 42; i++) {
      const date = new Date(currentDate);
      const isCurrentMonth = date.getMonth() === month;
      const dateString = date.toDateString();
      const entries = this.entriesByDate().get(dateString) ?? [];

      days.push({
        date,
        dayOfMonth: date.getDate(),
        isCurrentMonth,
        entries,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  });

  readonly legendTypes = computed(() => {
    return Object.keys(this.legend());
  });

  readonly hasLegendEntries = computed(() => {
    return this.legendTypes().length > 0;
  });

  isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  getDotColorClass(type: string): string {
    // Map common type names to Tailwind classes
    const colorMap: { [key: string]: string } = {
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      yellow: 'bg-yellow-500',
      red: 'bg-red-500',
      blue: 'bg-blue-500',
      gray: 'bg-gray-400',
    };

    return colorMap[type] || 'bg-gray-400';
  }

  previousMonth(): void {
    const newDate = new Date(this.currentMonth());
    newDate.setMonth(newDate.getMonth() - 1);
    this.currentMonth.set(newDate);
  }

  nextMonth(): void {
    const newDate = new Date(this.currentMonth());
    newDate.setMonth(newDate.getMonth() + 1);
    this.currentMonth.set(newDate);
  }

  onDayClick(date: Date): void {
    this.dayClick.emit(date);
  }
}
