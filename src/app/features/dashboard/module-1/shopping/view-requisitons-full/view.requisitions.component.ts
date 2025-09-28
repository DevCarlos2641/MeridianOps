import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Api } from 'src/app/core/service/api.';
import { RequisitionFullComponent } from 'src/app/shared/component/requisition-full/requisition-full.component';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { MatButtonModule } from '@angular/material/button';
import { Data } from 'src/app/core/service/data';

@Component({
  selector: 'app-shopping',
  imports: [RequisitionFullComponent, MatButtonModule],
  templateUrl: './view.requisitions.component.html',
  styleUrl: './view.requisitions.component.scss',
})
export class ViewRequisitionsComponent {

  private readonly api = inject(Api);
  private destroyRef = inject(DestroyRef);
  private readonly data = inject(Data);
  role = 0;

  ngOnInit(){
    this.role = this.data.user.role;
  }

  exportExcel(type: number, name: string) {
    this.api.requisition.getToExcel(type).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
      this.exportAsExcelFile(res, name);
    })
  }

  exportAsExcelFile(json: any[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ['data'],
    };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    FileSaver.saveAs(data, `${fileName}_${new Date().getTime()}.xlsx`);
  }
}