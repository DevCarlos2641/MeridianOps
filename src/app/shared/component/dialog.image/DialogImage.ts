import { Component, inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'dialog-comment',
  imports: [MatIcon],
  template: `
  <div class="body">
    <div style="text-align: end;">	<mat-icon (click)="close()">close</mat-icon></div>
    <img [src]="previewImage" width="500px" (error)="erroraImage()">
  </div>
  `,
  styles: `
  .body{
    margin: 20px;
    text-align: center;
  }
  `
})
export class DialogImage {

  readonly dialogRefC = inject(MatDialogRef<DialogImage>);
  readonly data = inject<string>(MAT_DIALOG_DATA);
  previewImage: string;

  ngOnInit() {
    this.previewImage = this.data;
  }

  erroraImage(){
    this.previewImage = "assets/image.png";
  }

  close(){
    this.dialogRefC.close();
  }

}