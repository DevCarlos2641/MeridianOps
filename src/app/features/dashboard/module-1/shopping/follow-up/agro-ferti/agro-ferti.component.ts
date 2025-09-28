// import { Component, ChangeDetectionStrategy, inject, DestroyRef } from "@angular/core";
// import { ReactiveFormsModule } from "@angular/forms";
// import { MatCheckboxModule } from "@angular/material/checkbox";
// import { provideNativeDateAdapter } from "@angular/material/core";
// import { MatDividerModule } from "@angular/material/divider";
// import { MatFormFieldModule } from "@angular/material/form-field";
// import { MatIconModule } from "@angular/material/icon";
// import { MatPaginatorModule } from "@angular/material/paginator";
// import { MatSelectModule } from "@angular/material/select";
// import { MatTableDataSource, MatTableModule } from "@angular/material/table";
// import { UtilsFollowUp } from "../shared/utils";
// import { ActivatedRoute } from "@angular/router";
// import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
// import { ResponseGetRequisitionFull } from "src/app/shared/model/dto/ResponseGetRequisitionFull";
// import { Api } from "src/app/core/service/api.";
// import { Data } from "src/app/core/service/data";

// @Component({
//     selector: 'app-shopping-agro-ferti',
//     imports: [MatTableModule, MatIconModule, MatFormFieldModule, ReactiveFormsModule, MatSelectModule, MatCheckboxModule, MatPaginatorModule,
//         MatDividerModule
//     ],
//     providers: [provideNativeDateAdapter()],
//     templateUrl: './agro-ferti.component.html',
//     styleUrl: './agro-ferti.component.scss',
//     changeDetection: ChangeDetectionStrategy.OnPush,
// })
// export class FollowUpComponenet extends UtilsFollowUp{

//     columns = ['date', 'name', 'description', 'amount', 'supplier'];
//     dataSource: any;
//     statusSelected: string;
//     statusCurrent: string;
//     statusDisabled = true;
//     ordered = false;
//     prices = false;
//     requisition: ResponseGetRequisitionFull;
//     id_requisition = 0;

//     ngOnInit() {
//         this.route.paramMap
//             .pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
//                 this.id_requisition = Number(params.get('id'));
//                 if (!this.id_requisition){
//                     this.showErrorDialog();
//                     this.ngOnDestroy();
//                 }
//             });

//         this.requisition = this.data.requisitionAssign;
//         if (this.requisition.category === 'Agroquímicos y fertilizantes') this.isAgro = true;
//         this.api.voucher.getIds(this.id_requisition).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
//             this.vouchers = res;
//             if (this.vouchers.length == 1) {
//                 this.voucherSelected = this.vouchers[0]
//                 this.setDataSource(this.voucherSelected);
//             }
//         })
//     }

//     ngOnDestroy(){

//     }

//     changeStatus() {
//         if (this.statusCurrent === this.statusSelected) return;

//         if (this.statusSelected === 'Comprado') {
//             this.columns.push('ordered', 'prices');
//             this.ordered = true;
//             this.prices = true;
//         }
//     }

//     saveVoucher(){

//     }

// }