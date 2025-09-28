import { AsyncPipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, DestroyRef, inject, Pipe, PipeTransform, ViewChild } from "@angular/core";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatButtonModule } from "@angular/material/button";
import { MatDialog } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatSelectModule } from "@angular/material/select";
import { MatSort } from "@angular/material/sort";
import { MatTable, MatTableDataSource, MatTableModule } from "@angular/material/table";
import { ActivatedRoute, Router } from "@angular/router";
import { firstValueFrom, map, Observable, startWith, Subject, takeUntil } from "rxjs";
import { Api } from "src/app/core/service/api.";
import { Data } from "src/app/core/service/data";
import { AlertDialogComponent } from "src/app/shared/component/alert.dialog/alert.dialog.component";
import { PdsByReq, PdsByVoucher } from "src/app/shared/model/dto/ResponseGetPdsByReq";
import { ResponseGetRequisitionFull } from "src/app/shared/model/dto/ResponseGetRequisitionFull";
import { VoucherProduct } from "src/app/shared/model/VoucherProduct";
import { formatDateEs, getPriority, getStatus } from "src/app/shared/util/FunctionsUtils";
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Voucher } from "src/app/shared/model/dto/Voucher";
import { EnumStatus } from "src/app/shared/model/EnumStatusRq";
import { Requisition } from "src/app/shared/model/Requisition";
import { DialogComment } from "src/app/shared/component/dialog.comment/dialog.comment";
import { RequestVoucher } from "src/app/shared/model/dto/RequestVoucher";
import { EnumStatusVO } from "src/app/shared/model/EnumStatusVo";
import { EnumStatusPds } from "src/app/shared/model/EnumStatusPds";
import { NgClass } from "@angular/common";
import { ProductNewOrUpdateComponent } from "src/app/shared/component/product-new-update/product-new-update.component";
import { LoadingDialogService } from "src/app/core/service/loading-dialog.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { SlugifyPipe } from "src/app/shared/pipes/SlugifyPipe";

@Component({
  selector: 'app-assign-voucher',
  imports: [MatButtonModule, MatIconModule, MatTableModule, MatPaginatorModule, MatInputModule, FormsModule, ReactiveFormsModule,
    MatSelectModule, MatAutocompleteModule, AsyncPipe, MatCheckboxModule, NgClass
  ],
  templateUrl: './assign.voucher.component.html',
  styleUrl: './assign.voucher.component.scss',
})
export class AssignVoucherComponent {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('paginator2') paginator2!: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  columnsPds = ['name', 'description_pd', 'amount', 'unit', 'description_rq', 'supplier', 'guard', 'arrived', 'missing'];
  columnsAgro = ['name', 'house_name', 'description_pd', 'amount', 'unit', 'description_rq', 'supplier', 'arrived', 'missing'];
  columns2 = ['economic', 'type', 'model', 'services'];
  columns = this.columnsPds;
  dataSource = new MatTableDataSource<PdsByReq>();
  nVoucher = '';
  nVoucherExtra = '';
  nFolio = "";
  nService = '';
  activeFolio = false;
  enterprise = '';

  private id_requisition: number | null = null;
  private readonly dialog = inject(MatDialog);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly data = inject(Data);
  private readonly api = inject(Api);
  private destroyRef = inject(DestroyRef);

  suppliers: string[];
  suppliersAll: SupplierName[];
  filteredSupplier$: Observable<string[]>;
  formControl = new FormControl('');
  checkSpllier: CheckSupplier[] = [];
  checkSpplierV: CheckSupplierV[] = [];
  checkDisabled: CheckSupplier[] = [];
  checkGuard: CheckGuard[] = [];
  checkDisabledV: CheckSupplierV[] = [];
  productsStatus: PdsByVoucher[] = [];
  requisition: ResponseGetRequisitionFull;
  products = true;
  vehicles = false;
  mantt = false;

  ngOnInit() {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
        this.id_requisition = Number(params.get('id'));
        if (!this.id_requisition)
          this.showErrorDialog();
        this.api.products.getProductsByIdRequisition(this.id_requisition).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(dt => {
          if (dt.pds) {
            this.productsStatus = dt.pdsV;
            this.dataSource = new MatTableDataSource(dt.pds);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            // const ids: number[] = [];
            dt.pds.forEach(value => {
              const voucherPd = new VoucherProduct();
              voucherPd.id = 0;
              voucherPd.id_voucher = '0';
              voucherPd.id_product = value.id_product;
              voucherPd.amount = value.amount;
              voucherPd.description = "";
              this.data.voucherProducts.add(voucherPd);
              // ids.push(value.id_product);
              const pd = dt.pdsV.find(v => v.id_product == value.id_product);
              if (pd && pd.status != 2) {
                value.arrived = pd.arrived;
                const rest = value.amount - pd.arrived;
                if (rest !== 0 && rest !== value.amount) this.checkSpllier.push({ id_product: value.id_product, check: false, arrived: pd.arrived });
                else this.checkDisabled.push({ id_product: value.id_product, check: true, arrived: pd.arrived });
              }
              else {
                this.checkSpllier.push({ id_product: value.id_product, check: false, arrived: 0 });
                this.checkGuard.push({ id_product: value.id_product, check: false });
                value.arrived = 0;
              }
            });
            this.assignSuppliers();
          } else {
            // se cambia la tabla para que muestre vehiculos en vez de productos, tambien muestra provedores de mantenimiento de vehiculos.
            this.products = false;
            this.vehicles = true;
            this.dataSource = new MatTableDataSource(dt.vehs);
            setTimeout(() => {
              if (this.paginator2)
                this.dataSource.paginator = this.paginator2;
            }, 0);
            this.dataSource.sort = this.sort;
            dt.vehs.forEach(value => {
              value.services.forEach((e: any) => {
                const v = dt.pdsVehs.find(v => v.id_vehicle === value.id_vehicle && e.id_service_vehicle === v.id_service);
                if (v) this.checkDisabledV.push({ id_service: v.id_service, id_vehicle: value.id_vehicle, check: true });
                else this.checkSpplierV.push({ id_service: e.id_service_vehicle, id_vehicle: value.id_vehicle, check: false });
              });
            })
            this.assignSuppliersVehicles();
          }
        });
      });
    this.requisition = this.data.requisitionAssign;
    if (this.requisition.category === 'Agroquímicos y fertilizantes') {
      this.columns = this.columnsAgro;
      this.activeFolio = true;
    }
    if (this.requisition.category === 'Maquinaria y equipo agrícola (Stock)')
      this.mantt = true;
    this.enterprise = this.data.user.enterprise_name;
  }

  ngOnDestroy() {
    this.data.requisitionAssign = new ResponseGetRequisitionFull();
    this.data.voucherProducts.set([]);
  }

  private assignSuppliers() {
    this.api.suppliers.get().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
      this.suppliersAll = Object(res);
      this.suppliers = this.suppliersAll.map(s => s.name);
      this.filteredSupplier$ = this.formControl.valueChanges.pipe(
        startWith(''),
        map(value => this.filterSupplier(value || ''))
      );
    });
  }

  private assignSuppliersVehicles() {
    this.api.suppliers.getVehicles().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
      this.suppliersAll = Object(res);
      this.suppliers = this.suppliersAll.map(s => s.name);
      this.filteredSupplier$ = this.formControl.valueChanges.pipe(
        startWith(''),
        map(value => this.filterSupplier(value || ''))
      );
    });
  }

  private showErrorDialog(): void {
    const message = "No seleccionó una requisición, por favor seleccione una.";
    this.dialog.open(AlertDialogComponent, {
      data: { message, cancel: false, accept: true }
    });
  }

  private filterSupplier(value: string): string[] {
    const filter = value.toLowerCase();
    return this.suppliers.filter(sp => sp.toLowerCase().includes(filter));
  }

  backToRequisitions() {
    if (this.data.routerHistory) this.router.navigateByUrl('dashboard/compras/historial');
    else this.router.navigateByUrl('dashboard/compras/requisiciones');
  }

  // getSupplierProduct(id_product: number, name: string) {
  //   // this.api.suppliers.getSupplierByProduct(id_product).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
  //   //   const dialogRef = this.dialog.open(DialogSupplierProducts, { data: { name, suppliers: res } });
  //   //   dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => {
  //   //     if (value)
  //   //       this.data.voucherProducts.update(id_product, { id_supplier: value.id_supplier, name_supplier: value.name })
  //   //   });
  //   // })
  // }

  async saveVoucher() {
    const supplier = this.formControl.value;

    // 1️⃣ Validaciones de productos y proveedor
    if (this.checkSpllier.length === 0 && this.products) {
      this.dialog.open(AlertDialogComponent, {
        data: { message: "Todos los productos ya han sido asignados a un vale.", cancel: false, accept: true }
      });
      return;
    }

    if (supplier === '') {
      this.dialog.open(AlertDialogComponent, {
        data: { message: "Favor de ingresar un proveedor.", cancel: false, accept: true }
      });
      return;
    }

    if (!this.checkSpllier.some(c => c.check === true) && this.products) {
      this.dialog.open(AlertDialogComponent, {
        data: { message: "No ha seleccionado algún producto.", cancel: false, accept: true }
      });
      return;
    }

    // 2️⃣ Validaciones de folio activo
    if (this.activeFolio) {
      this.nVoucher = '-1';

      if (!this.nFolio || this.nFolio.trim() === '') {
        this.dialog.open(AlertDialogComponent, {
          data: { message: "Favor de ingresar un número de folio.", cancel: false, accept: true }
        });
        return;
      }

      const patternF = /^\d{4}-\d+$/;
      if (!patternF.test(this.nFolio)) {
        this.dialog.open(AlertDialogComponent, {
          data: { message: "Formato de folio incorrecto.", cancel: false, accept: true }
        });
        return;
      }
    }

    // 3️⃣ Validaciones de vehículos o mantenimiento
    if (this.vehicles || this.mantt) {
      this.nVoucher = '-2';

      if (!this.nService || this.nService.trim() === '') {
        this.dialog.open(AlertDialogComponent, {
          data: { message: "Favor de ingresar un número de vale de servicio o mantenimiento.", cancel: false, accept: true }
        });
        return;
      }

      const patternM = /^[A-Z]{2}-\d+$/;
      if (!patternM.test(this.nService)) {
        this.dialog.open(AlertDialogComponent, {
          data: { message: "Formato de vale incorrecto.", cancel: false, accept: true }
        });
        return;
      }
    }

    // 4️⃣ Validaciones generales de número de vale (cuando no es folio activo ni mantenimiento)
    if ((this.nVoucher === '' || !this.nVoucher) && !this.activeFolio && !this.mantt) {
      this.dialog.open(AlertDialogComponent, {
        data: { message: "Favor de ingresar un número de vale.", cancel: false, accept: true }
      });
      return;
    }
    if (!this.activeFolio && !this.mantt && !this.vehicles) {
      const patternV = /^[A-Z]{0,2}\d+$/;
      if (!patternV.test(this.nVoucher) && !this.mantt && !this.activeFolio) {
        this.dialog.open(AlertDialogComponent, {
          data: { message: "Formato de vale no válido.", cancel: false, accept: true }
        });
        return;
      }
    }


    const id_supplier = this.suppliersAll.find(s => s.name == supplier)?.id;
    const voucher = new Voucher();
    const date = new Intl.DateTimeFormat('sv-SE').format(new Date());
    voucher.id_voucher = this.nVoucher;
    if (this.vehicles || this.mantt) voucher.id_folio = this.nService.toUpperCase();
    else voucher.id_folio = this.nFolio;
    voucher.id_requisition = this.requisition.id;
    voucher.id_supplier = id_supplier ? id_supplier : 0
    voucher.id_user_buy = 0;                                 // Quien compra la mercancia por default es 0
    voucher.id_user = this.data.user.id;                      // Quien hizo la requisición
    voucher.status = EnumStatusVO.EN_PROCESO;
    voucher.comment = "";
    voucher.authorize = true;
    voucher.date = date;
    voucher.name_supplier = supplier ? supplier : '';
    voucher.extra = this.nVoucherExtra;

    const updateRequisition = new Requisition()
    updateRequisition.category = this.requisition.category;
    updateRequisition.id = this.requisition.id;
    updateRequisition.id_user = this.data.user.id;
    updateRequisition.id_voucher = voucher.id_voucher;
    updateRequisition.status = EnumStatus.EN_PROCESO;

    const message = "¿Algún comentario que quiera agregar para este vale?"
    const dialog1 = this.dialog.open(DialogComment, { data: { message, comment: '' } });
    let comment = await firstValueFrom(dialog1.afterClosed());
    if (!comment) comment = '';
    voucher.comment = comment;

    if (this.vehicles) {
      this.sendVoucherVehicle(voucher, updateRequisition);
      return;
    }

    const pds = this.data.voucherProducts.get();
    const checkTrue = this.checkSpllier.filter(c => c.check == true);
    // solamente entrar los que productos cancelados y no que aun no se asignan a un vale.
    const voucherPds = checkTrue
      .map(c => {
        const pd = pds.find(v => v.id_product == c.id_product);
        if (pd) {
          pd.amount = pd.amount - c.arrived;
          pd.id_voucher = voucher.id_voucher;
          if (this.productsStatus.find(v => v.id_product === pd.id_product)?.status == 2)
            pd.status = EnumStatusPds.REINTEGRADO;
          else
            pd.status = EnumStatusPds.PENDIENTE;
        }
        return pd;
      })
      .filter(pd => pd !== undefined);

    const request: RequestVoucher = {
      voucher: voucher,
      pds: voucherPds,
      vehs: [],
      requisition: updateRequisition,
      guards: this.checkGuard.filter(v => v.check)
    };
    this.sendApi(request);
  }

  sendApi(request: RequestVoucher) {
    const message2 = "¿Desea continuar?";
    const dialog2 = this.dialog.open(AlertDialogComponent, { data: { message: message2, cancel: true, accept: true } })
    dialog2.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe(v => {
        if (!v) return;
        this.api.voucher.postVoucher(request).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
          const val = Object(res);
          let message = ""
          if (val.error) message = "Este número de vale ya ha sido registrado, Intente con otro";
          else message = "Se ha registrado correctamente el Vale."
          this.dialog.open(AlertDialogComponent, { data: { message, cancel: false, accept: true } });
          if (!val.error) {
            this.router.navigateByUrl('dashboard/compras/requisiciones');
          }
        })
      })
  }

  updateProduct(id: number) {
    this.api.products.getById(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(product => {
      const dialog = this.dialog.open(ProductNewOrUpdateComponent, { data: { product, isAgro: this.activeFolio } });
      dialog.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(p => {
        if (!p) return;
        const current = this.dataSource.data;
        p.house_name = p.house;
        const update = current.map(v =>
          v.id_product === p.id ? { ...v, ...p } : v
        )
        this.dataSource = new MatTableDataSource(update);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      })
    })
  }

  private sendVoucherVehicle(voucher: Voucher, updateRequisition: Requisition) {
    const checkTrue = this.checkSpplierV.filter(c => c.check == true);
    const vehs = checkTrue.map(v => ({
      id_service: v.id_service,
      id_vehicle: v.id_vehicle,
      status: EnumStatus.PENDIENTE
    }));
    const request: RequestVoucher = {
      voucher: voucher,
      pds: [],
      vehs: vehs,
      requisition: updateRequisition,
      guards: []
    };
    this.sendApi(request);
  }

  getChecked(id_product: number) {
    const item = this.checkSpllier.find(c => c.id_product == id_product);
    return item ? item.check : false;
  }

  getCheckedGuard(id_product: number) {
    const item = this.checkGuard.find(c => c.id_product === id_product);
    return item ? item.check : false;
  }

  updateGuard(completed: boolean, id: number) {
    const update = this.checkGuard.map(v =>
      v.id_product === id ? { id_product: id, check: completed } : v
    );
    this.checkGuard = update
  }

  getCheckedVehicle(id_service: number, id_vehicle: number) {
    const item = this.checkSpplierV.find(c => c.id_service === id_service && c.id_vehicle === id_vehicle);
    return item ? item.check : false;
  }

  getDisabled(id_product: number) {
    const item = this.checkDisabled.find(c => c.id_product == id_product);
    return item ? item.check : false;
  }

  getDisabledVehicle(id_service: number, id_vehicle: number) {
    const item = this.checkDisabledV.find(c => c.id_service === id_service && c.id_vehicle === id_vehicle);
    return item ? item.check : false;
  }

  getClassItem(id_product: number) {
    const item = this.checkDisabled.find(c => c.id_product == id_product);
    if (!item) {
      switch (this.requisition.enterprise_name) {
        case 'MeridianOps':
          return "meridian-ops_h";
        case 'AVOCATS':
          return "avocats_h";
        case 'AVOAGO':
          return "avoago_h";
        case 'AGRONEV':
          return 'agronev_h';
      }
    } else {
      switch (this.requisition.enterprise_name) {
        case 'MeridianOps':
          return "meridian-ops";
        case 'AVOCATS':
          return "avocats";
        case 'AVOAGO':
          return "avoago";
        case 'AGRONEV':
          return 'agronev';
      }
    }
    return '';
  }

  getClassItemV(id_vehicle: number, id_service: number) {
    const item = this.checkDisabledV.find(c => c.id_vehicle === id_vehicle && c.id_service === id_service);
    if (!item) {
      switch (this.requisition.enterprise_name) {
        case 'MeridianOps':
          return "meridian-ops_h";
        case 'AVOCATS':
          return "avocats_h";
        case 'AVOAGO':
          return "avoago_h";
        case 'AGRONEV':
          return 'agronev_h';
      }
    } else {
      switch (this.requisition.enterprise_name) {
        case 'MeridianOps':
          return "meridian-ops";
        case 'AVOCATS':
          return "avocats";
        case 'AVOAGO':
          return "avoago";
        case 'AGRONEV':
          return 'agronev';
      }
    }
    return '';
  }

  update(completed: boolean, id: number) {
    const current = this.checkSpllier;
    const update = current.map(c =>
      c.id_product === id ? { id_product: c.id_product, check: completed, arrived: c.arrived } : { ...c }
    )
    this.checkSpllier = update;
  }

  updateVehicle(complete: boolean, id_service: number, id_vehicle: number) {
    const current = this.checkSpplierV;
    const update = current.map(c =>
      (c.id_service === id_service && c.id_vehicle === id_vehicle) ? { id_service: c.id_service, id_vehicle: c.id_vehicle, check: complete } : { ...c }
    )
    this.checkSpplierV = update;
  }

  getPriority(value: number) {
    return getPriority(value);
  }

  getStatus(value: number) {
    return getStatus(value)
  }

  formatDateEs(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
    return formatDateEs(date);
  }

}

interface SupplierName {
  id: number;
  name: string;
}

interface CheckSupplier {
  id_product: number;
  check: boolean;
  arrived: number;
}

interface CheckSupplierV {
  id_vehicle: number;
  id_service: number;
  check: boolean;
}

interface CheckGuard {
  id_product: number,
  check: boolean
}