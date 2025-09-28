import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { debounceTime, distinctUntilChanged, firstValueFrom, Observable, Subject, takeUntil } from 'rxjs';
import { Api } from 'src/app/core/service/api.';
import { Data } from 'src/app/core/service/data';
import { Product } from 'src/app/shared/model/Product';
import { Requisition } from 'src/app/shared/model/Requisition';
import { MatSelectModule } from '@angular/material/select';
import { EnumPriority } from 'src/app/shared/model/EnumPriority';
import { EnumStatus } from 'src/app/shared/model/EnumStatusRq';
import { ProductRequisition } from 'src/app/shared/model/ProductRequisition';
import { AlertDialogComponent } from 'src/app/shared/component/alert.dialog/alert.dialog.component';
import { formatDateEs, getPriority, getStatus } from 'src/app/shared/util/FunctionsUtils';
import { DialogComment } from 'src/app/shared/component/dialog.comment/dialog.comment';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { showProductsComponent } from 'src/app/shared/component/show-products/show.products.component';
import { EnumCategory } from 'src/app/shared/model/EnumCategory';
import { Vehicle } from 'src/app/shared/model/Vehicle';
import { TablePVComponent } from 'src/app/shared/component/tableRequisition/table.requisition.component';
import { VehicleItemsComponent } from 'src/app/shared/component/vehicleItems/items.vehicle.component';
import { LoadingDialogService } from 'src/app/core/service/loading-dialog.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { quitarTildes } from 'src/app/shared/util/FunctionsUtils';
import { environment } from 'src/environments';

@Component({
  selector: 'app-requisition',
  imports: [MatTabsModule, MatTableModule, MatPaginator, ReactiveFormsModule, MatIcon, MatInputModule,
    MatButtonModule, AsyncPipe, FormsModule, MatDatepickerModule, MatSortModule, MatSelectModule, TablePVComponent],
  templateUrl: './requisition.component.html',
  styleUrl: './requisition.component.scss',
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequisitionComponent {

  @ViewChild('paginator2') paginator2: MatPaginator;
  @ViewChild('sort2') sort2: MatSort;

  columns = ['name', 'description', 'application', 'unit', 'image'];
  columns2 = ['delete', 'date', 'id_requisition', 'status', 'priority', 'comment', 'cart'];
  columnsV = ['economic_number', 'enterprise_name', 'type', 'brand', 'model', 'status'];
  dataSource = new MatTableDataSource<any>([]);
  dataSource2 = new MatTableDataSource<any>();
  dataSource3 = new MatTableDataSource<any>();
  searchControl = new FormControl();
  searchControl2 = new FormControl();
  private readonly api = inject(Api);
  private readonly loadingDialog = inject(LoadingDialogService);
  private readonly data = inject(Data);
  private readonly dialog = inject(MatDialog);
  requisition$ = new Observable<Product[]>();
  vehiclesReq$ = new Observable<Vehicle[]>();
  nRequisition = '';

  categories: string[] = [];
  categorySelected = "General";

  products = true;
  vehicles = false;

  rangeForm = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  constructor() {
    // TODO : Ver el paginator para no obtener todos los productos

    this.api.products.get().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
      res = res.map( v=> ({...v, image: `${environment.apiUrl}/files/products/${v.id}.webp?v=${Date.now()}`})
      )
      this.dataSource = new MatTableDataSource(res);
      this.dataSource.filterPredicate = (data, filtro: string) => {
        const dataStr = Object.values(data).join(' ').toLowerCase();
        return quitarTildes(dataStr).includes(quitarTildes(filtro));
      };
    })

    this.data.historyRequisition.asObservable()
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe(dt => {
        this.dataSource2 = new MatTableDataSource(dt);
        this.dataSource2.filterPredicate = (data, filtro: string) => {
          const dataStr = Object.values(data).join(' ').toLowerCase();
          return quitarTildes(dataStr).includes(quitarTildes(filtro));
        };
        this.dataSource2.paginator = this.paginator2;
        this.dataSource2.sort = this.sort2;
      })
  }

  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    this.searchControl.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((term: string) => {
      const value = term.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (this.products) {
        this.dataSource.filter = value.trim().toLowerCase();

        if (this.dataSource.paginator) {
          this.dataSource.paginator.firstPage();
        }
      } else {
        this.dataSource3.filter = value.trim().toLowerCase();
        if (this.dataSource3.paginator) {
          this.dataSource3.paginator.firstPage();
        }
      }
    });

    this.searchControl2.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((term: string) => {
      const value = term.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      this.dataSource2.filter = value.trim().toLowerCase();
      if (this.dataSource2.paginator) this.dataSource2.paginator.firstPage();
    })

    this.categories = Object.values(EnumCategory);

    this.requisition$ = this.data.requisition.asObservable();
    this.vehiclesReq$ = this.data.requisitionVeh.asObservable();
    this.loadHistory();
  }

  deleteItem(id: number, n: number) {
    const startDate = this.rangeForm.value.start;
    const endDate = this.rangeForm.value.end;

    const message =
      `¡Alerta!\n\n` +
      `Está a punto de eliminar una requisición.\n` +
      `Requisición N° ${n}\n` +
      `¿Desea continuar?`;

    const dialogRef = this.dialog.open(AlertDialogComponent, {
      data: { message, cancel: true, accept: true }
    });

    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(val => {
        if (!val) return;
        // Se elimina la requisición por id
        this.api.requisition.delete(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
          if (res) {
            if (!startDate || !endDate) {
              this.data.historyRequisition.set([]);
              this.loadHistory;
            } else {
              this.onDateRangeSelected();
            }
            const message = `Se elimino la requisición N° ${n} correctamente`;
            const dialofRef2 = this.dialog.open(AlertDialogComponent, { data: { message, cancel: false, accept: true } });
            dialofRef2.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
          }
        });
      });
  }

  getAmount(id: number) {
    return this.data.requisitionPd.find(id)?.amount;
  }

  addProductToRequisition(row: Product) {
    const product = { ...row };
    if (!this.data.requisition.find(product.id)) {
      product.amount = 1;
      this.data.requisition.addBegin(product);
      const requisitionPd = this.getRequisitionPd(product.id);
      this.data.requisitionPd.add(requisitionPd);
    }
  }

  addVehicleToRequisition(row: Vehicle) {
    const ve = { ...row };
    if (!this.data.requisitionVeh.find(ve.id)) {
      this.data.requisitionVeh.addBegin(ve);
    }
  }

  onAmountChange(event: Event, id: number) {
    const valor = (event.target as HTMLInputElement).value;
    const amount = Number(valor);
    this.data.requisitionPd.update(id, { amount: amount });
    this.data.requisition.update(id, { amount: amount })
  }

  private getRequisitionPd(id: number): ProductRequisition {
    const reqPd = new ProductRequisition();
    reqPd.id_requisition = 0;             // Lo genera el back-end cuando da de alta la requision
    reqPd.id = 0                          // Lo genera la base de datos
    reqPd.id_product = id;                // Recibe como parametro el id del producto
    reqPd.amount = 1;                     // Se inicializa en 1 pero cambia dependiente la interaccion del usuario
    reqPd.description = ""                // Se inicializa en vacio pero cambia dependiente la interaccion del usuario
    return reqPd;
  }

  deleteProductRequisition(id: number) {
    this.data.requisition.delete(id);
    this.data.requisitionPd.delete(id);
  }

  deleteVehicleRequisition(id: number) {
    this.data.requisitionVeh.delete(id);
  }

  cleanrequisition() {
    if (this.products) {
      this.data.requisition.set([]);
      this.data.requisitionPd.set([]);
    }
    else {
      this.data.requisitionVeh.set([]);
    }
  }

  addItems(id: number) {
    const value = this.data.requisitionVeh.find(id);
    if (!value) return;
    const dialogRef = this.dialog.open(VehicleItemsComponent, { data: value.items });
    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
      if (res) this.data.requisitionVeh.update(id, { items: res });
    })
  }

  changeStatus() {
    if (this.categorySelected === 'Mantenimiento de vehículos') {

      this.api.vehicle.getByUser().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {

        this.dataSource3 = new MatTableDataSource(res);
      });
      this.cleanrequisition();
      this.products = false;
      this.vehicles = true;

    } else if (this.vehicles) {
      this.cleanrequisition();
      this.products = true;
      this.vehicles = false;
    }
  }

  addCommentToProduct(id: number) {
    const message = "¿Para qué y en qué sector se usará?"
    const comment = this.data.requisitionPd.find(id)?.description;
    const dialogRef = this.dialog.open(DialogComment, { data: { message, comment } });
    dialogRef.afterClosed()

      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => {
        if (!value) return;
        this.data.requisitionPd.update(id, { description: value });
      })
  }

  private verifiedComments(): boolean {
    for (const e of this.data.requisitionPd.get()) {
      if (!e.description || e.description === '') {
        return true;
      }
    }
    return false;
  }

  async saveRequisition() {
    if (this.verifiedComments()) {
      this.showMessage("Aun faltan productos por agregar comentarios", false, true);
      return;
    }
    if (!this.nRequisition || this.nRequisition == '') {
      this.showMessage("Aun falta de proporcionar el número de requisición.", false, true);
      return;
    }
    const requsition = await this.factoryRequesition();
    if (!requsition) return;
    const message = "Está a punto de enviar la requisición, ¿Desea continuar?"
    const dialogRef = this.dialog.open(AlertDialogComponent, { data: { message, cancel: true, accept: true } })
    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => {
        if (value) {

          this.api.requisition.postRequisition(requsition, this.data.requisitionPd.get())
            .pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {

              const values = Object(res);
              if (values.exist) {
                this.showMessage("El numero de requisición ya fue asignado.", false, true);
                return;
              }
              const message = "Requisición enviada exitosamente"
              const dialogRef2 = this.dialog.open(AlertDialogComponent, { data: { message, cancel: false, accept: true } })
              dialogRef2.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
              requsition.id = res.id_requisition;
              this.data.historyRequisition.add(requsition);
              this.cleanrequisition();
            })
        }
      })
  }

  verifiedItems() {
    for (const e of this.data.requisitionVeh.get()) {
      if (!e.items || e.items.length === 0) {
        return true;
      }
    }
    return false;
  }

  async saveRequisitionVehicles() {
    //  Verifica que todos lo vehiculos contengan algun servicio por lo menos.
    if (this.verifiedItems()) {
      this.showMessage("Aun no asigna servicios a los vehículos", false, true);
      return;
    }

    //  Verifica que se halla asiganado un numero de requisicion
    if (!this.nRequisition || this.nRequisition == '') {
      this.showMessage("Aun falta de proporcionar el número de requisición.", false, true);
      return;
    }

    const requsition = await this.factoryRequesition();
    if (!requsition) return;
    const vehicles = this.data.requisitionVeh.get().map(v => ({ id: v.id, services: v.items }))
    const message = "Está a punto de enviar la requisición, ¿Desea continuar?"
    const dialogRef = this.dialog.open(AlertDialogComponent, { data: { message, cancel: true, accept: true } })
    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => {
        if (value) {
          this.api.requisition.postRequisitionVehicle(requsition, vehicles)
            .pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {

              const values = Object(res);
              if (values.exist) {
                this.showMessage("El numero de requisición ya fue asignado.", false, true);
                return;
              }
              const message = "Requisición enviada exitosamente"
              const dialogRef2 = this.dialog.open(AlertDialogComponent, { data: { message, cancel: false, accept: true } })
              requsition.id = res.id_requisition;
              this.data.historyRequisition.add(requsition);
              this.cleanrequisition();
            })
        }
      })
  }

  private showMessage(message: string, cancel: boolean, accept: boolean) {
    this.dialog.open(AlertDialogComponent, { data: { message, cancel, accept } })
    return;
  }

  private async factoryRequesition(): Promise<Requisition | null> {
    let comment = "";
    const message = "¿Algún comentario que agregar para esta requisición? O ¿Vale de resguardo?";
    const dialogRef = this.dialog.open(DialogComment, { data: { message } });
    const rc = await firstValueFrom(dialogRef.afterClosed());
    if (rc) comment = rc;
    else {
      const message = "Tiene que agregar un comentario o vale de resguardo.";
      this.dialog.open(AlertDialogComponent, { data: { message, cancel: false, accept: true } });
      return null;
    }

    const dialogRef2 = this.dialog.open(DialogPriority);
    let priority = await firstValueFrom(dialogRef2.afterClosed());
    if (!priority) priority = EnumPriority.BAJA;

    const date = new Intl.DateTimeFormat('sv-SE').format(new Date());
    const req = new Requisition();
    req.id = 0;                                       // Lo asigna la base de datos
    req.category = this.categorySelected;
    req.id_requisition = this.nRequisition;           // numero fisico
    req.id_user_requisition = this.data.user.id;      // Quien hace la requisición
    req.id_user = 0;                                  // Quien ira a comprar, lo asigna compras
    req.id_voucher = '';                               // Lo asigna COMPRAS
    req.date = date;                                  // Fecha con la cual se envia la requisicion
    req.comment = comment;                            // Comentarios sobre la requisición
    req.priority = priority                           // Prioridad de la requisición
    req.status = EnumStatus.PENDIENTE                 // Todas inicializan en "Pendiente"
    return req;
  }

  private loadHistory() {
    if (this.data.historyRequisition.get().length != 0) return;
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
    this.api.requisition.getRequisition(data).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
      this.data.historyRequisition.set(res);
    })
  }

  getPriority(value: number) {
    return getPriority(value);
  }

  getStatus(value: number) {
    return getStatus(value)
  }

  formatDateEs(date: Date) {
    return formatDateEs(date);
  }

  showProducts(element: any) {
    element.enterprise_name = this.data.user.enterprise_name;
    element.ranch_name = this.data.user.ranch_name;
    if (element.category === "Mantenimiento de vehículos") {
      this.api.vehicle.getVehiclesByIdRequisition(element.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
        const dialogRef = this.dialog.open(showProductsComponent, { data: { products: res, requisition: element } });
        dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
      })
    } else {
      this.api.products.getProductsByIdRequisition(element.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
        const dialogRef = this.dialog.open(showProductsComponent, { data: { products: res.pds, requisition: element } });
        dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
      })
    }
  }

  onDateRangeSelected() {
    const startDate = this.rangeForm.value.start;
    const endDate = this.rangeForm.value.end;
    if (!startDate || !endDate) return;
    if (startDate > endDate) return;
    const startStr = this.formatDate(startDate);
    const endStr = this.formatDate(endDate);
    this.processDateRange(startStr, endStr);
  }

  // Función para formatear Date a yyyy-mm-dd
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }


  processDateRange(start: string, end: string) {
    const data = {
      start: start,
      end: end
    };
    this.api.requisition.getRequisition(data).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
      this.data.historyRequisition.set(res);
    })
  }

}

@Component({
  selector: 'dialog-priority',
  imports: [MatButtonModule, MatInputModule, MatSelectModule, MatInputModule, FormsModule, MatIconModule],
  template: `
  <div class="body">
    <p>¿Qué prioridad tiene esta requisición?</p>
    <mat-form-field>
      <mat-label>Prioridad</mat-label>
      <mat-select [(value)]="selected">
        @for (p of priority; track p) {
          <mat-option [value]="p">{{p}}</mat-option>
        }
      </mat-select>
    </mat-form-field><br>
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
class DialogPriority {
  readonly dialogRef = inject(MatDialogRef<DialogPriority>);

  selected = 'Baja';
  priority = ["Baja", "Media", "Alta"];

  onSubmit() {
    let value = EnumPriority.BAJA;
    if (this.selected == "Baja") value = EnumPriority.BAJA;
    if (this.selected == "Media") value = EnumPriority.MEDIA;
    if (this.selected == "Alta") value = EnumPriority.ALTA;

    this.dialogRef.close(value);
  }

}