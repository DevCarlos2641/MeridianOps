import { Component, inject } from "@angular/core";
import { ReactiveFormsModule, FormControl } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";

@Component({
  selector: 'dialog-comment',
  imports: [MatButtonModule, MatInputModule, ReactiveFormsModule, MatIconModule],
  template: `
  <div class="body">
    <p>{{data.message}}</p>
    <mat-form-field class="example-full-width" class="comment">
      <mat-label></mat-label>
      <textarea 
        matInput placeholder="Comentarios"
        [formControl]="searchControl"
        (keydown.enter)="onSubmit()"></textarea>
    </mat-form-field>
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
export class DialogComment {

  readonly dialogRefC = inject(MatDialogRef<DialogComment>);
  readonly data = inject<any>(MAT_DIALOG_DATA);

  searchControl = new FormControl('');

  ngOnInit() {
    this.searchControl.setValue(this.data.comment);
  }

  onSubmit() {
    this.dialogRefC.close(this.searchControl.value ?? '');
  }

}