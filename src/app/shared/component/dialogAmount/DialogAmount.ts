import { Component, inject } from "@angular/core";
import { ReactiveFormsModule, FormControl } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";

@Component({
  selector: 'dialog-amount',
  imports: [MatButtonModule, MatInputModule, MatIconModule, ReactiveFormsModule],
  template: `
  <div class="container">
    <p>{{data}}</p>
    <mat-form-field class="example-full-width">
      <mat-label>Cantidad</mat-label>
      <input matInput placeholder="0" 
        type="number" 
        (keydown.enter)="onSubmit()"
        [formControl]="amountControl"
      >
    </mat-form-field>
  <button matMiniFab class="btn" (click)="onSubmit()">
    <mat-icon>check_circle</mat-icon>
  </button>
  </div>
  `,
  styles: `
  .container{
    margin: 20px;
  }
  .btn{
    margin-left: 20px
  }
  `
})
export class DialogAmount {
  readonly dialogRef = inject(MatDialogRef<DialogAmount>);
  readonly data = inject<string>(MAT_DIALOG_DATA);
  amountControl = new FormControl();

  onSubmit(){
    if(Number(this.amountControl.value))
      this.dialogRef.close(Number(this.amountControl.value));
  }

}