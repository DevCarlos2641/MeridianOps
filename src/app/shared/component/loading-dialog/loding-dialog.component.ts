import { Component } from '@angular/core';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-dialog',
  template: `
    <div style="text-align: center; padding: 2rem;">
      <div style="display: flex; justify-content: center;">
        <mat-spinner></mat-spinner>
      </div>
        <p>Cargando, por favor espera...</p>
    </div>
  `,
  imports: [MatProgressSpinnerModule],
  standalone: true
})
export class LoadingDialogComponent {}
