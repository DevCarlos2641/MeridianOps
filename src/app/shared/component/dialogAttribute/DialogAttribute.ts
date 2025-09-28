import { Component, inject } from "@angular/core";
import { ReactiveFormsModule, FormControl } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";

@Component({
  selector: 'dialog-attribute',
  imports: [MatButtonModule, MatInputModule, ReactiveFormsModule, MatIconModule],
  template: `
  <div class="body">
    <p>{{data.message}}</p>
    <mat-form-field class="example-full-width">
      <mat-label>{{data.attr}}</mat-label>
      <input matInput [formControl]="attribute"(keydown.enter)="onSubmit()"/>
    </mat-form-field>
    <br>
    <button matMiniFab class="btn" (click)="onSubmit()">
      <mat-icon>check_circle</mat-icon>
    </button>
  </div>
  `,
  styles: `
  .body{
    margin: 20px;
    text-align: center;
  }
  .comment{
    width: 100%;
  }
  `
})
export class DialogAttribute {

  readonly dialogRefC = inject(MatDialogRef<DialogAttribute>);
  readonly data = inject<any>(MAT_DIALOG_DATA);

  attribute = new FormControl('');

  ngOnInit() {
    this.attribute.setValue(this.data.value);
  }

  onSubmit() {
    this.dialogRefC.close(this.attribute.value ?? '');
  }

}