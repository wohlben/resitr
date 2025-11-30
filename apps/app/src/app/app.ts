import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './components/ui/feedback/toast.component';
import { ConfirmationDialogComponent } from './components/ui/dialogs/confirmation-dialog.component';

@Component({
  imports: [RouterOutlet, ToastComponent, ConfirmationDialogComponent],
  selector: 'app-root',
  template: `
    <router-outlet></router-outlet>
    <app-toast />
    <app-confirmation-dialog />
  `,
})
export class App {}
