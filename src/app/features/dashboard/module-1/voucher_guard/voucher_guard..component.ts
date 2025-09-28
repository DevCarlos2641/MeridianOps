import { DatePipe } from "src/app/shared/pipes/DatePipe";
import { Component, DestroyRef, inject, ViewChild } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatToolbarModule } from "@angular/material/toolbar";
import { Api } from "src/app/core/service/api.";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { ResponseGetRequisitionFull } from "src/app/shared/model/dto/ResponseGetRequisitionFull";
import { SlugifyPipe } from "src/app/shared/pipes/SlugifyPipe";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { Data } from "src/app/core/service/data";

@Component({
  selector: 'app-voucher-guard',
  imports: [MatSidenavModule, MatButtonModule, MatToolbarModule, MatIconModule, MatTableModule, DatePipe, SlugifyPipe,
    MatPaginatorModule
  ],
  templateUrl: './voucher_guard.component.html',
  styleUrl: './voucher_guard.component.scss'
})
export class VoucherGuardComponent {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  columns = ['date', 'id', 'category', 'enterprise', 'ranch', 'comment', 'voucher'];
  dataSource = new MatTableDataSource<ResponseGetRequisitionFull>([]);

  private readonly api = inject(Api);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly data = inject(Data);

  ngOnInit() {
    const date = new Date().toLocaleDateString('es-MX', {
      timeZone: 'America/Mexico_City', // Zona horaria de Guadalajara
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).split('/').reverse().join('-');
    const data = {
      start: date,
      end: date
    };
    this.api.requisition.getRequisitionFullGuard(data).subscribe(res => {
      this.dataSource = new MatTableDataSource(res);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    })
  }

  navigateToAssignGuard(element: any){
    if(element.id_employed) return;
    const id_voucher = element.id_voucher;
    this.data.commentVoucher = element.comment;
    this.router.navigate(['dashboard/asignar-resguardo', id_voucher]);
  }

}