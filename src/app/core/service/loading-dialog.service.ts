import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LoadingDialogComponent } from 'src/app/shared/component/loading-dialog/loding-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class LoadingDialogService {
  private dialogRef?: MatDialogRef<LoadingDialogComponent>;

  constructor(private dialog: MatDialog) {}

  open(): void {
    if (!this.dialogRef) {
      this.dialogRef = this.dialog.open(LoadingDialogComponent, {
        disableClose: true, // <- Esto evita que lo puedan cerrar
        panelClass: 'transparent-dialog', // opcional para estilos
      });
    }
  }

  close(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
      this.dialogRef = undefined;
    }
  }
}
