import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  name: string;
  url?: string;
  children?: NavItem[];
}

@Component({
  selector: 'app-main-navigation',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="flex flex-col h-full bg-gray-900 text-white w-64 flex-shrink-0">
      <div class="p-6">
        <h1 class="text-2xl font-bold tracking-wider text-blue-500">ResiTr</h1>
      </div>

      <div class="flex-1 px-4 space-y-2 overflow-y-auto">
        <a
          routerLink="/"
          routerLinkActive="bg-gray-800 text-blue-400"
          [routerLinkActiveOptions]="{ exact: true }"
          class="flex items-center px-4 py-3 text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors group"
        >
          <span class="font-medium">Dashboard</span>
        </a>

        @for (section of navItems; track section.name) {
        <div class="pt-4 pb-2">
          <p class="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{{ section.name }}</p>
        </div>

        @if (section.children) { @for (item of section.children; track item.url) {
        <a
          [routerLink]="item.url"
          routerLinkActive="bg-gray-800 text-blue-400"
          class="flex items-center px-4 py-3 text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
        >
          <span class="font-medium">{{ item.name }}</span>
        </a>
        } } }
      </div>

      <div class="p-4 border-t border-gray-800">
        <div class="flex items-center gap-3 px-4 py-2">
          <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">U</div>
          <div class="text-sm">
            <p class="font-medium">User</p>
            <p class="text-gray-500 text-xs">Settings</p>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }
    `,
  ],
})
export class MainNavigationComponent {
  navItems: NavItem[] = [
    {
      name: 'Compendium',
      children: [
        { name: 'Equipments', url: '/compendium/equipments' },
        { name: 'Exercises', url: '/compendium/exercises' },
        { name: 'Exercise Groups', url: '/compendium/exercise-groups' },
        { name: 'Workouts', url: '/compendium/workouts' },
      ],
    },
    {
      name: 'User',
      children: [
        { name: 'Workouts', url: '/user/workouts' },
        { name: 'Calendar', url: '/user/calendar' },
      ],
    },
  ];
}
