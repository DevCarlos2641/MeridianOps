import { trigger, transition, style, animate, keyframes } from '@angular/animations';
import { AsyncPipe } from '@angular/common';
import { Component, DestroyRef, inject, Output, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { fromEvent, Subject, takeUntil } from 'rxjs';
import { Api } from 'src/app/core/service/api.';
import { Data } from 'src/app/core/service/data';
import { LoadingDialogService } from 'src/app/core/service/loading-dialog.service';
import { AlertDialogComponent } from 'src/app/shared/component/alert.dialog/alert.dialog.component';
import { DialogComment } from 'src/app/shared/component/dialog.comment/dialog.comment';
import { DialogAmount } from 'src/app/shared/component/dialogAmount/DialogAmount';
import { DialogEmployedComponent } from 'src/app/shared/component/dialogEmployeds/dialog-employed.component';
import { ProductNewOrUpdateComponent } from 'src/app/shared/component/product-new-update/product-new-update.component';
import { ProductsComponent } from 'src/app/shared/component/products/products.compoenent';
import { RequestOutputPds } from 'src/app/shared/model/dto/RequestOutputPds';
import { OutPut } from 'src/app/shared/model/Output';
import { OutputProduct } from 'src/app/shared/model/OutputProduct';
import { Requisition } from 'src/app/shared/model/Requisition';
import { EnumRole } from 'src/app/shared/model/TableSQL/EnumRole';
import { DatePipe } from 'src/app/shared/pipes/DatePipe';
import { quitarTildes } from 'src/app/shared/util/FunctionsUtils';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { TableVehicleMaquinariaComponent } from 'src/app/shared/component/table-vehicle-maquinaria/Table-vehicle-maquinaria.component';
import { Ranch } from 'src/app/shared/model/Ranch';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-inventory',
  imports: [MatTabsModule, ReactiveFormsModule, MatInputModule, MatIconModule, MatButtonModule,
    ProductsComponent, MatTableModule, ProductNewOrUpdateComponent, MatPaginatorModule, DatePipe, MatSelectModule, FormsModule
  ],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-500px)' }),
        animate('500ms ease-out', keyframes([
          style({ opacity: 1, transform: 'translateY(220px)' }),
          style({ transform: 'translateY(-10px)' }),
          style({ transform: 'translateY(0px)' }),
        ])),
      ]),
    ])]
})
export class InventoryComponent {

  dataSourceNewProducts = new MatTableDataSource();
  searchControl = new FormControl();
  searchRq = new FormControl();
  searchInput = new FormControl();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  readonly columns = ['name', 'application', 'unit']
  private readonly dialog = inject(MatDialog);
  private readonly dataService = inject(Data);
  private readonly api = inject(Api);
  private readonly loadingDialog = inject(LoadingDialogService);
  typeData = "newProducts"
  dataProducts = "products"
  altas = false;
  bajas = false;
  tabInAndOut = false;
  requisition: Requisition;
  showRequisition: boolean = false;
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = "";
  ids: number[] = [];
  idSelected: number = 0;
  currentRanch: Ranch;
  ranchs: Ranch[] = [];
  description = '';
  inve = false;

  output_vehicle: any = null;
  output_product: any[] = [];
  output_employed: any = null;

  dataSource: any;
  columnsOutput = ['name', 'application', 'description', 'amount', 'amount_output', 'unit', 'sobra', 'delete']

  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    if (this.dataService.products.getAll().length === 0) {
      this.api.products.getProductsByUser().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
        this.dataService.products.setProducts(res);
      })
    }
    const role = this.dataService.user.role;
    if (role == EnumRole.INVENTORY) {
      this.tabInAndOut = true;
    }
    if (role == EnumRole.AUXILIAR) {
      this.inve = true;
    }

    this.dataService.productOutput.asObservable()
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe(re => {
        this.dataSource = new MatTableDataSource(re);
        this.dataSource.filterPredicate = (data: string, filtro: string) => {
          const dataStr = Object.values(data).join(' ').toLowerCase();
          return quitarTildes(dataStr).includes(quitarTildes(filtro));
        };
        this.dataSource.paginator = this.paginator;
      }
      )

    this.api.users.getAllRanchs().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
      this.ranchs = res
    });
  }

  downloadReq() {
    this.api.voucher.getVoucherInputs().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
      const doc = new jsPDF();

      // Título
      doc.setFontSize(16);
      doc.text("Reporte de Requisiciones pendientes de Entrada", 14, 15);

      // Encabezados de la tabla
      const head = [['N° Requisición', 'Fecha', 'Proveedor']];

      // Filas con los datos
      const body = res.map(d => [
        d.N_Requisicion,
        d.Fecha,
        d.Provedor
      ]);

      // Generar tabla
      autoTable(doc, {
        startY: 25,
        head: head,
        body: body,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] }, // Azul elegante
        styles: { fontSize: 10, cellPadding: 3 }
      });

      // Guardar o abrir
      doc.save("Requisiciones pendientes.pdf");
    })
  }

  openDialog() {
    const dialogRef = this.dialog.open(ProductsComponent, {
      data: { columns: this.columns, type: 'baja' },
      width: 'auto',
      height: 'auto',
    })
    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  openDialogAlta() {
    const dialogRef = this.dialog.open(ProductsComponent, {
      data: { columns: this.columns },
      width: 'auto',
      height: 'auto',
    })
    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  deleteItem(id: number) {
    this.output_product = this.output_product.filter(v => v.id !== id);
  }

  openDialogBajaGeneral() {
    const dialogRef = this.dialog.open(ProductsComponent, {
      data: { columns: this.columns, type: "general" },
      width: 'auto',
      height: 'auto',
    })
    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
      if (res) {
        res.out = 1;
        this.output_product.push(res)
      }
    });
  }

  openDialogEmpl() {
    const dialog = this.dialog.open(DialogEmployedComponent,
      { data: { complete: false } });
    dialog.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
      if (res) {
        this.output_employed = res;
      }
    })
  }

  openDialogVehicle() {
    const dialog = this.dialog.open(TableVehicleMaquinariaComponent, { data: { category: "vehicle" } });
    dialog.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
      if (res)
        this.output_vehicle = (res);
    })
  }

  removeItem(id_product: number) {
    this.dataService.productOutput.delete(id_product);
  }

  searchRequisition() {
    const value = this.searchRq.value;
    if (!value || value === '' || Number(value) === 0) return;

    this.api.voucher.getIdsInput(value).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
      if (res.error) {
        this.resetRequisition();
        return
      }
      if (res.ids.length > 0) {
        this.searchRq.disable();
        this.showRequisition = true;
        this.requisition = res.requisition;
        this.ids = res.ids.map(v => v.id);
        this.dataService.newProducts.set([]);
      }
    })
  }

  resetRequisition() {
    this.searchRq.setValue('');
    this.searchRq.enable();
    this.showRequisition = false;
    this.ids = [];
    this.idSelected = 0;
    this.previewUrl = null;
    this.dataService.newProducts.set([]);
  }

  save() {
    if (this.output_product.length === 0) return;
    if (this.description === '') return;
    const outputs = this.output_product.map(v => ({
      id_product: v.id,
      amount: v.out
    }))
    const data = {
      id_vehicle: this.output_vehicle ? this.output_vehicle.id : null,
      id_employed: this.output_employed ? this.output_employed.id : null,
      description: this.description,
      outputs: outputs
    }
    const message = "¿Desea continuar?";
    const dialogRef = this.dialog.open(AlertDialogComponent, { data: { message, cancel: true, accept: true } });
    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
      if (res) {
        this.api.products.postOutputGeneral(data).subscribe(v => {
          if (v) {
            const message = "Mercancía dado de baja correctamente";
            const dialogRef = this.dialog.open(AlertDialogComponent, { data: { message, cancel: false, accept: true } });
            outputs.forEach(v => {
              this.dataService.products.updateOutputGeneral({ id: v.id_product, amount: v.amount });
            })
            this.cleanAll();
          }
        });
      }
    })
  }

  cleanAll() {
    this.output_employed = null;
    this.output_product = [];
    this.output_vehicle = null;
    this.description = '';
  }

  changeId() {
    this.api.voucher.getProductsIds(this.idSelected).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
      this.dataService.newProducts.set([]);
      this.searchInput.setValue('');
      this.checkProductsInDb(res);
    })
  }

  private checkProductsInDb(pds: any[]) {
    const ids: number[] = [];
    pds.forEach(v => {
      const pd = this.dataService.products.getById(v.id_product);
      if (!pd) ids.push(v.id_product);
    })
    if (ids.length === 0) this.setTableProducts(pds);
    else {
      // se agrega a rach y se agrega la lista actual;
      this.api.products.addInRanch(ids).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
        if (res) {
          res.forEach(v => {
            v.amount = 0;
            this.dataService.products.add(v);
          });
          this.setTableProducts(pds);
        }
      });
    }
  }

  private setTableProducts(pds: any[]) {
    pds.forEach(v => {
      const pd = { ...this.dataService.products.getById(v.id_product)!! };
      pd.amount_input = v.amount;
      this.dataService.newProducts.add(pd);
    });
  }

  changeUnitForProduct(id_product: number) {
    const product = this.dataService.productOutput.find(id_product);
    if (!product) return;
    const message = "Unidades por envase"
    const dialog = this.dialog.open(DialogAmount, { data: message });
    dialog.afterClosed()

      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
        if (res) {
          const data = {
            id: id_product,
            unit_for_product: Number(res)
          }

          this.api.products.updateUnitForProduct(data).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(dt => {

            const total = product.amount * res;
            const left = product.left = total - product.amountOutput;
            const result = Math.round(left * 100) / 100;
            this.dataService.productOutput.update(id_product, { unit_for_product: Number(res), left: result });
            this.dataService.products.update({ id: id_product, unit_for_product: Number(res) });
          })
        }
      })
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file && file.type.startsWith('image/')) {
      this.selectedFile = file;

      const reader = new FileReader();

      fromEvent(reader, 'load').pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        this.previewUrl = reader.result;
      })

      fromEvent(reader, 'error').pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        console.error('Error al leer el archivo');
        this.previewUrl = null;
      });

      reader.readAsDataURL(file);

    } else {
      alert('Solo se permiten imágenes');
      this.selectedFile = null;
      this.previewUrl = null;
    }
  }

  onSaveImage() {
    if (!this.selectedFile) return;
    if (!this.searchInput.value || this.searchInput.value == '') return;
    const formData = new FormData();
    const name = `${this.searchRq.value}-${this.searchInput.value}.png`;
    formData.append('image', this.selectedFile, name);
    formData.append('category', "field_input");
    this.api.voucher.postImage(formData).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
      const message = "Imagen guardada correctamente."
      this.dialog.open(AlertDialogComponent, { data: { message, cancel: false, accept: true } })
    })
  }

  handleErrorImage(event: Event) {
    event.preventDefault();
    this.previewUrl = null;
  }

  changeOutput(id_product: number) {
    const product = this.dataService.productOutput.find(id_product);
    if (!product) return;
    const message = "Cantidad de salida"
    const dialog = this.dialog.open(DialogAmount, { data: message })
    dialog.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
      if (res) {
        const total = product.amount;
        const left = total - res;
        this.dataService.productOutput.update(id_product, { amountOutput: res, left });
      }
    });
  }

  getNewProducts() {
    return this.dataService.newProducts.asObservable();
  }

  cleanNewMerch() {
    if (this.dataService.newProducts.get().length == 0 && this.altas) return;
    if (this.dataService.productOutput.get().length == 0 && this.bajas) return;

    const message = "Está a punto de limpiar la lista, ¿Desea Continuar?";
    const dialogOpen = this.dialog.open(AlertDialogComponent, {
      data: {
        message,
        cancel: true,
        accept: true
      }
    });
    dialogOpen.afterClosed()

      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe(re => {
        if (re) {
          if (this.altas) {
            this.dataService.newProducts.set([]);
            this.searchInput.setValue('');
            this.searchRq.setValue('');
          }
          if (this.bajas)
            this.dataService.productOutput.set([]);
        }
      })
  }

  saveNewMerch() {
    if (this.dataService.productOutput.get().length === 0 && this.bajas) return;
    if (this.dataService.newProducts.get().length === 0 && this.altas) return;
    const input = this.searchInput.value;
    if ((!input || input === '' || Number(input) === 0) && this.altas) {
      const message = "Debe de agregar el numero de vale de entrada";
      this.dialog.open(AlertDialogComponent, { data: { message, cancel: false, accept: true } });
      return;
    }

    const message = "Está a punto de guardar los cambios, ¿Desea Continuar?";
    const dialogOpen = this.dialog.open(AlertDialogComponent, {
      data: {
        message,
        cancel: true,
        accept: true
      }
    });

    dialogOpen.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe(re => {
        if (re) {
          if (this.altas) this.sendNewMerch();
          else this.sendOutput();
        }
      })
  }

  private sendOutput() {
    // const some = this.dataService.productOutput.get().some(v => Number(v.unit_for_product) === 0);
    // if (some) {
    //   const message = "Aun hay productos que no tienen “cantidad por producto”, favor de ingresar y continuar.";
    //   this.dialog.open(AlertDialogComponent, { data: { message, cancel: false, accept: true } });
    //   return;
    // }
    const message = "Agregue observaciones o comentarios";
    const dialog = this.dialog.open(DialogComment, { data: { message, comment: '' } });
    dialog.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(cmt => {
      if (!cmt) return;
      const pds = this.dataService.productOutput.get();
      const output = new OutPut();
      const outputPds: OutputProduct[] = [];
      output.id_user = this.dataService.user.id;
      output.comment = cmt;
      pds.forEach(v => {
        const outputPd = new OutputProduct();
        outputPd.id_product = v.id;
        outputPd.amount = v.amountOutput;
        outputPd.unit = v.unit;
        outputPd.comment = '';
        outputPds.push(outputPd);
      })
      const data = new RequestOutputPds();
      data.output = output;
      data.pds = outputPds;

      this.api.products.postOutput(data).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {

        if (!res) {
          const message = "Algo salio mal, intente de nuevo";
          this.dialog.open(AlertDialogComponent, { data: { message, cancle: false, accept: true } });
        } else {
          const message = "Se ha guardado exitosamente la salida de mercancía.";
          this.dataService.products.updateOutput(data.pds);
          this.dialog.open(AlertDialogComponent, { data: { message, cancle: false, accept: true } });
          this.dataService.productOutput.set([]);
        }
      })
    });
  }

  private sendNewMerch() {
    const message = "Productos guardado con éxito";
    const pds = this.dataService.newProducts.get();
    const id_ranch = this.dataService.user.id_ranch;
    const amounts = pds.map(v => {
      return {
        id: v.id,
        id_ranch: id_ranch,
        amount: v.amount_input,
        expiration: v.expiration
      }
    })
    const data = {
      pds: amounts,
      id_requisition: this.searchRq.value,
      id_voucher: this.idSelected,
      id_input: this.searchInput.value
    }

    this.api.products.addAmount(data).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {

      const value = Object.values(res)[0];
      if (!value.error) {
        this.searchInput.setValue('');
        this.dataService.products.updateStockLocal(pds);
        this.resetRequisition();
        this.dialog.open(AlertDialogComponent, { data: { message, cancel: false, accept: true } })
      }
    });
  }

  onInput() {
    this.altas = true;
    this.bajas = false;
  }

  onOutput() {
    this.altas = false;
    this.bajas = true;
  }

  downloadFormat() {
    this.api.products.downloadFormat().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
      this.exportAsExcelFile(res, "Productos");
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

  async onFileChange(evt: Event) {
    if (!this.currentRanch) {
      const message = "Debe seleccionar un rancho";
      const dialogRef = this.dialog.open(AlertDialogComponent, { data: { message, cancel: false, accept: true } }); 7
      dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
      return;
    }
    const id_ranch = this.currentRanch.id;
    const input = evt.target as HTMLInputElement;

    if (!input.files || input.files.length !== 1) {
      alert('Selecciona un único archivo Excel.');
      return;
    }

    const file = input.files[0];

    try {
      // Leemos el archivo como ArrayBuffer (recomendado)
      const arrayBuffer = await file.arrayBuffer();

      // Parseamos con XLSX
      const wb: XLSX.WorkBook = XLSX.read(arrayBuffer, { type: 'array' });

      // Tomamos la primera hoja
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      // Convertimos a JSON (arreglo de arreglos)
      const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

      if (data.length < 2) {
        alert('El archivo no contiene datos.');
        return;
      }

      // Mapeamos: asumimos formato fijo: id, name, description, stock
      const productos = data.slice(1).map(row => ({
        id: row[0],
        name: row[1],
        description: row[2],
        stock: row[3]
      }));

      const upload = {
        products: productos,
        id_ranch
      };
      const message = `
        Está a punto de subir el inventario\n
        ¿Que subirá?\n
        Rancho: ${this.currentRanch.name}\n
        Numero de productos: ${upload.products.length}\n
        ¿Desea Continuar?`;

      const dialog = this.dialog.open(AlertDialogComponent, { data: { message, cancel: true, accept: true } });
      dialog.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => {
        if (!value) return;
        this.api.products.uploadProducts(upload).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
          if (res) {
            const message = "Inventario cargado correctamente";
            const dialog = this.dialog.open(AlertDialogComponent, { data: { message, cancel: false, accept: true } });
            dialog.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
          }
        })
      })

      // Enviar al backend

    } catch (error) {
      console.error("Error leyendo el archivo:", error);
    } finally {
      // Limpieza: liberamos referencia al input para evitar fugas
      input.value = '';
    }
  }

}