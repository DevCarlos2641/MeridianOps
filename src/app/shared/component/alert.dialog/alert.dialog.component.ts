import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';


@Component({
  selector: 'app-alert.dialog',
  imports: [MatButtonModule],
  templateUrl: './alert.dialog.component.html',
  styleUrl: './alert.dialog.component.scss'
})
export class AlertDialogComponent {

  readonly dialogRef = inject(MatDialogRef<AlertDialogComponent>);
  readonly data = inject<any>(MAT_DIALOG_DATA);


  cancel(){
    this.dialogRef.close(false);
  }

  accept(){
    this.dialogRef.close(true);
  }

  onNoClick(): void {
    this.dialogRef.close(null);
  }
}
