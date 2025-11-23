import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainNavigationComponent } from './main-navigation.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, MainNavigationComponent],
  template: `
    <div class="flex h-screen bg-gray-100 overflow-hidden">
      <app-main-navigation class="h-full hidden md:block"></app-main-navigation>

      <!-- Main Content Area -->
      <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <!-- Mobile Header (Visible only on small screens) -->
        <div class="md:hidden bg-gray-900 text-white p-4 flex items-center justify-between">
          <span class="font-bold text-xl text-blue-500">ResiTr</span>
          <button class="p-2 rounded hover:bg-gray-800">
            <!-- Hamburger Icon placeholder -->
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>

        <!-- Scrollable Content -->
        <div class="flex-1 overflow-auto p-6 md:p-8">
          <div class="max-w-7xl mx-auto w-full">
            <router-outlet></router-outlet>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }
  `]
})
export class MainLayoutComponent { }
