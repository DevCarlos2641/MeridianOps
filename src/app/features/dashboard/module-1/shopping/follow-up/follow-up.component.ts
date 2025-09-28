import { AsyncPipe, CommonModule } from "@angular/common";
import { Component, DestroyRef, inject, ViewChild } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { provideNativeDateAdapter } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatDividerModule } from "@angular/material/divider";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatPaginatorModule, MatPaginator } from "@angular/material/paginator";
import { MatSelectModule } from "@angular/material/select";
import { MatSortModule, MatSort } from "@angular/material/sort";
import { MatTableModule, MatTableDataSource } from "@angular/material/table";
import { ActivatedRoute, Router } from "@angular/router";
import { fromEvent, map, Observable, startWith } from "rxjs";
import { Api } from "src/app/core/service/api.";
import { Data } from "src/app/core/service/data";
import { AlertDialogComponent } from "src/app/shared/component/alert.dialog/alert.dialog.component";
import { CheckProducts } from "src/app/shared/model/CheckProducts";
import { RequestComment } from "src/app/shared/model/dto/RequestComment";
import { RequestStatus } from "src/app/shared/model/dto/RequestStatus";
import { ResponseGetRequisitionFull } from "src/app/shared/model/dto/ResponseGetRequisitionFull";
import { Voucher } from "src/app/shared/model/dto/Voucher";
import { EnumStatus } from "src/app/shared/model/EnumStatusRq";
import { EnumStatusVO } from "src/app/shared/model/EnumStatusVo";
import { Requisition } from "src/app/shared/model/Requisition";
import { VoucherFiscal } from "src/app/shared/model/Voucher_fiscal";
import { FactorVoucherAgroPipe } from "src/app/shared/pipes/FactorVoucherAgroPipe";
import { formatDateEs, getPriority, getStatusVo } from "src/app/shared/util/FunctionsUtils";
import { environment } from "src/environments";
import { MatFormFieldModule } from '@angular/material/form-field';
import { trigger, transition, style, animate } from "@angular/animations";
import { SlugifyPipe } from "src/app/shared/pipes/SlugifyPipe";

@Component({
    selector: 'app-shopping',
    imports: [MatTableModule, MatInputModule, MatButtonModule, ReactiveFormsModule, MatIconModule, MatPaginatorModule,
        MatSortModule, ReactiveFormsModule, MatSelectModule, MatCheckboxModule, CommonModule, MatDividerModule, FormsModule,
        FactorVoucherAgroPipe, MatDatepickerModule, SlugifyPipe
    ],
    providers: [provideNativeDateAdapter()],
    templateUrl: './follow-up.component.html',
    styleUrl: './follow-up.component.scss',
    animations: [
        trigger('fadeInOut', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(-10px)' }),
                animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
            ]),
            transition(':leave', [
                style({ position: 'absolute' }),
                animate('200ms ease-in', style({ opacity: 0 }))
            ])
        ]),
        trigger('expandCollapse', [
            transition(':enter', [
                style({ height: '0px', opacity: 0, marginBottom: '0px' }),
                animate('200ms ease-in', style({ opacity: 0 }))
            ]),
            transition(':leave', [
                style({ position: 'absolute' }),
                animate('200ms ease-in', style({ opacity: 0 }))
            ])
        ])
    ]
})
export class FollowUpComponenet {

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild('paginator2') paginator2: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    columns = ['date', 'name', 'description', 'amount', 'supplier'];
    columnsV = ['date', 'economic_number', 'type', 'brand', 'model', 'services'];
    dataSource: any;
    dataSource2: any;
    id_requisition = 0;
    vouchers: number[] = [];
    voucherSelected = '';
    status = ["En proceso", "Comprado", "Finalizado"];
    statusSelected: string;
    statusCurrent: string;
    statusDisabled = true;
    requisition: ResponseGetRequisitionFull;
    arrived = false;
    arrived2 = false;
    amount = false;
    prices = false;
    productsStatus: CheckProducts[] = [];
    productsCancel: CheckProducts[] = [];
    comments: string[] = [];
    comment = "";
    formNFactura = new FormControl();
    formContrarecibo = new FormControl();
    formISR = new FormControl(0);
    formIEPS = new FormControl(0);
    IVA = true;
    dateControl = new FormControl<Date | null>(null, [
        Validators.required,
        this.validateDate.bind(this)
    ]);
    dateControlInvoice = new FormControl<Date | null>(null, [
        Validators.required,
        this.validateDate.bind(this)
    ]);
    voucherFiscal = new VoucherFiscal();
    vouchersPrimary: any = [];
    enterprise = '';
    total: string | number = '';
    voucherInput: any;

    isAgro = false;

    products = false;
    vehicles = false;
    credit = false;
    inputFechaContra = false;
    isFolio = false;

    selectedFile: File | null = null;
    previewUrl: string | ArrayBuffer | null = "";

    private readonly api = inject(Api);
    private readonly route = inject(ActivatedRoute);
    private readonly dialog = inject(MatDialog);
    private readonly router = inject(Router);
    private readonly data = inject(Data);

    private destroyRef = inject(DestroyRef);

    ngOnInit() {
        this.route.paramMap
            .pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
                this.id_requisition = Number(params.get('id'));
                if (!this.id_requisition)
                    this.showErrorDialog();
            });

        this.requisition = this.data.requisitionAssign;
        if (this.requisition.category === 'Agroquímicos y fertilizantes') {
            this.isAgro = true;
        }
        this.api.voucher.getIds(this.id_requisition).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
            this.vouchers = res.map(v => v[0]);
            this.vouchersPrimary = res;
            if (this.vouchers.length == 1) {
                this.voucherSelected = String(this.vouchers[0])
                this.setDataSource(this.voucherSelected);
            }
        })
        this.enterprise = this.data.user.enterprise_name;
    }

    ngOnDestroy() {
        this.data.requisitionAssign = new ResponseGetRequisitionFull();
        this.data.voucherProducts.set([]);
    }

    private validateDate(control: FormControl): { [key: string]: any } | null {
        const value = control.value;
        if (value instanceof Date && !isNaN(value.getTime())) {
            return null; // Fecha válida
        }
        return { invalidDate: true }; // Fecha inválida
    }

    changeStatus() {
        if (this.vehicles) return;
        if (this.statusCurrent === this.statusSelected) return;

        this.cleanColumns();

        // Activar columnas para estado "Comprado"
        if (this.statusSelected === 'Comprado' && !this.isAgro) {
            this.columns.push('arrived', 'howMany', "prices");
            this.arrived = true;
            this.amount = true;
            this.prices = true;
        }
        if (this.statusSelected === 'Comprado' && this.isAgro) {
            this.inputFechaContra = true;
            this.columns.push('arrived', 'prices');
            this.arrived = true;
            this.prices = true;
        }

        // Activar columna para "Comprado" o "Finalizado" pero si no venía de "En proceso"
        if ((this.statusSelected === 'Comprado' || this.statusSelected === 'Finalizado') &&
            this.statusCurrent !== 'En proceso') {
            this.columns.push('arrived2');
            this.arrived2 = true;
        }
    }

    cleanColumns() {
        // Reset flags y columnas
        this.arrived = false;
        this.amount = false;
        this.arrived2 = false;
        this.prices = false;
        this.columns = ['date', 'name', 'description', 'amount', 'supplier']; // o lo que siempre quieras mostrar
    }

    cleanAll() {
        this.productsCancel = [];
        this.productsStatus = [];
        this.dateControl = new FormControl<Date | null>(null, [
            Validators.required,
            this.validateDate.bind(this)
        ]);
        this.dateControlInvoice = new FormControl<Date | null>(null, [
            Validators.required,
            this.validateDate.bind(this)
        ]);
        this.total = 0;
        this.IVA = true;
        this.formNFactura.setValue('');
        this.formISR.setValue(0);
        this.formIEPS.setValue(0);
    }

    setDataSource(id: string) {
        this.cleanColumns();
        this.cleanAll();
        let cat = "";
        if (this.requisition.category == "Mantenimiento de vehículos" || this.requisition.category == "Maquinaria y equipo agrícola (Stock)") {
            cat = "mantt";
            this.isFolio = true;
        }
        else cat = "shopping";
        this.previewUrl = `${environment.apiUrl}/files/voucher/${cat}/${this.id_requisition}-${this.voucherSelected}.webp?v=${Date.now()}`;
        this.api.voucher.getProducts(id, this.id_requisition).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
            this.voucherFiscal.id_voucher = res.voucher.id;
            this.voucherInput = res.input;

            if (res.fiscal) {
                this.formIEPS.setValue(res.fiscal.ieps ? res.fiscal.ieps : 0);
                this.formISR.setValue(res.fiscal.isr ? res.fiscal.isr : 0);
                this.IVA = res.fiscal.iva;
                this.total = res.fiscal.total ? Number(res.fiscal.total) : '';
                this.formNFactura.setValue(res.fiscal.id_invoice);
                if (res.fiscal.date) {
                    const date = new Date(res.fiscal.date);
                    const fixedDate = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
                    this.dateControl.setValue(fixedDate);
                }

                if (res.fiscal.date_invoice) {
                    const date2 = new Date(res.fiscal.date_invoice);
                    const fixedDate2 = new Date(date2.getTime() + (date2.getTimezoneOffset() * 60000))
                    this.dateControlInvoice.setValue(fixedDate2);
                }
            }
            if (res.pds) {
                // Datos de finalizacionn de vale de van a abrir en un dialogo;
                // this.formNFactura.setValue(res.voucher.id_invoice ? res.voucher.id_invoice : '');
                // this.formContrarecibo.setValue(res.voucher.contra_recibo ? res.voucher.contra_recibo : '');
                // this.dateControl.setValue(new Date(res.voucher.date_buy ? res.voucher.date_buy : new Date()));

                // Datos normales de todos los vales
                this.products = true;
                this.statusDisabled = false;
                this.statusSelected = getStatusVo(res.voucher.status);
                this.comments = res.comments.map(value => value.comment);
                if (this.statusSelected == "Finalizado") {
                    this.statusDisabled = true;
                }
                res.pds.forEach(v => {
                    // pendiente
                    if (Number(v.status_pd) == 0) {
                        this.productsStatus.push({ id_product: v.id_product, check: false, arrived: v.amount, price: 0 });
                    }
                    // comprado
                    else if (v.status_pd == 1) {
                        this.productsStatus.push({ id_product: v.id_product, check: true, arrived: v.arrived, price: 0 });
                        if (!this.arrived2 && !this.isAgro) {
                            this.columns.push('arrived2')
                            this.arrived2 = true;
                        }
                    }
                    // cancelado
                    else if (v.status_pd == 2) {
                        // this.productsStatus.push({ id_product: v.id_product, check: false, arrived: v.arrived });
                        this.productsCancel.push({ id_product: v.id_product, check: true, arrived: v.arrived, price: 0 });
                    }// reintegro
                    else if (v.status_pd == 3) {
                        this.productsStatus.push({ id_product: v.id_product, check: false, arrived: v.arrived, price: 0 });
                        if (!this.arrived2) {
                            this.columns.push('arrived2')
                            this.arrived2 = true;
                        }
                    }
                })
                if (this.isAgro && !this.arrived2 && this.voucherInput && this.voucherInput.id_input) {
                    this.columns.push('arrived2')
                    this.arrived2 = true;
                }
                this.statusCurrent = this.statusSelected;
                this.dataSource = new MatTableDataSource(res.pds);
                setTimeout(() => {
                    if (this.paginator)
                        this.dataSource.paginator = this.paginator;
                }, 0);
                this.dataSource.sort = this.sort;
            } else {
                this.products = false;
                this.vehicles = true;
                this.statusDisabled = false;
                this.statusSelected = getStatusVo(res.voucher.status);
                this.status = ["En proceso", "En mantenimiento", "Finalizado"];
                if (this.statusSelected === 'Comprado') this.statusSelected = "En mantenimiento";
                if (this.statusSelected == "Finalizado") this.statusDisabled = true;
                this.comments = res.comments.map(value => value.comment);

                this.statusCurrent = this.statusSelected;
                this.dataSource2 = new MatTableDataSource(res.vhs);
                setTimeout(() => {
                    if (this.paginator2)
                        this.dataSource2.paginator = this.paginator2;
                }, 0);
                this.dataSource2.sort = this.sort;
            }
        });
    }

    getValue(id_product: number) {
        const pd = this.productsStatus.find(v => v.id_product === id_product);
        return pd ? pd.arrived : 0;
    }

    saveDate() {
        if (!this.dateControl.value) return;
        const date = this.dateControl.value!!.toLocaleDateString('en-CA', { // en-CA da formato YYYY-MM-DD
            timeZone: 'America/Mexico_City'
        });
        if (!this.dateControlInvoice) return;
        const date2 = this.dateControlInvoice.value!!.toLocaleDateString('en-CA', { // en-CA da formato YYYY-MM-DD
            timeZone: 'America/Mexico_City'
        });
        this.voucherFiscal.date = date;
        this.voucherFiscal.date_invoice = date2;
        this.voucherFiscal.total = Number(this.total);
        this.voucherFiscal.id_invoice = this.formNFactura.value;
        this.voucherFiscal.iva = this.IVA;
        this.voucherFiscal.isr = this.formISR.value ? this.formISR.value : 0;
        this.voucherFiscal.ieps = this.formIEPS.value ? this.formIEPS.value : 0;
        this.api.voucher.putDateVoucherfiscal(this.voucherFiscal).pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(res => {
                if (res) {
                    const message = "Datos actualizados correctamente";
                    const dialogRef = this.dialog.open(AlertDialogComponent, { data: { message, cancel: false, accept: true } });
                    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
                }
            })
    }

    onAmountChange(event: Event, id: number) {
        const valor = (event.target as HTMLInputElement).value;
        const amount = Number(valor);
        const index = this.productsStatus.findIndex(p => p.id_product === id);
        if (index !== -1) {
            this.productsStatus[index].arrived = amount;
        }
    }

    backToRequisitions() {
        if (this.data.routerHistory) this.router.navigateByUrl('dashboard/compras/historial');
        else this.router.navigateByUrl('dashboard/compras/requisiciones');
    }

    private showErrorDialog(): void {
        const message = "No seleccionó una requisición, por favor seleccione una.";
        this.dialog.open(AlertDialogComponent, {
            data: { message, cancel: false, accept: true }
        });
        this.ngOnDestroy();
    }

    changeNumberVoucher() {
        const dialogRef = this.dialog.open(DialogChangeVoucher, { data: this.voucherSelected });
        dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
            if (res) {
                const data = { id_voucher: res };
                this.api.voucher.changeVoucher(this.voucherFiscal.id_voucher, data).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(val => {
                    if (res) {
                        this.saveSuccessful();
                    }
                })
            }
        });
    }

    saveVoucher() {
        if (this.statusCurrent == this.statusSelected) return;
        if (this.statusSelected == 'En mantenimiento') {
            const message = "Se guardaran los cambios, ¿Desea continuar?.";
            const dialogRef = this.dialog.open(AlertDialogComponent, { data: { message, cancel: true, accept: true } })
            dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
                if (res) {
                    const vhs = this.dataSource2.data.map((v: any) => ({ id: v.id_voucher, status: 1 }));
                    const requisition = new Requisition();
                    requisition.id = this.id_requisition;
                    requisition.status = EnumStatus.POR_RECIBIR;
                    const voucher = new Voucher();
                    voucher.id_folio = this.voucherSelected.toString();
                    voucher.status = EnumStatusVO.COMPRADO;
                    const data: RequestStatus = {
                        requisition: requisition,
                        voucher: voucher,
                        pdsStatus: vhs,
                        fiscal: null
                    };
                    this.api.voucher.setStatusVehicle(data)
                        .pipe(takeUntilDestroyed(this.destroyRef))
                        .subscribe(res => {
                            if (res) this.saveSuccessful();
                        });
                }
            })
        }
        if (this.statusSelected == "Comprado") {
            // const contra = this.formContrarecibo.value;
            // if (!this.dateControl.valid) {
            //     this.dateControl.markAllAsTouched();
            //     return;
            // }
            const message = this.products ? "Se guardarán los cambios, ¿Desea continuar?\n" +
                "Los productos no seleccionados se marcarán como cancelado, puede asignarle otro vale aparte si es que se requiere."
                : "Se guardarán los cambios, ¿Desea continuar?";
            const dialogRef = this.dialog.open(AlertDialogComponent, { data: { message, cancel: true, accept: true } })
            this.productsStatus.forEach(v => {
                const pd = this.dataSource.data.find((va: any) => va.id_product === v.id_product)
                if (pd)
                    v.price = Number(pd.unitary_price);
            })
            dialogRef.afterClosed()
                .pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => {
                    if (value) {
                        const requisition = new Requisition();
                        requisition.id = this.id_requisition;
                        requisition.status = EnumStatus.POR_RECIBIR;
                        const voucher = new Voucher();
                        voucher.id_voucher = this.voucherSelected;
                        voucher.status = EnumStatusVO.COMPRADO;
                        // voucher.contra_recibo = this.formContrarecibo.value!!;
                        // voucher.date_buy = this.formatearFecha(this.dateControl.value!!);
                        const data: RequestStatus = {
                            requisition: requisition,
                            voucher: voucher,
                            pdsStatus: this.products ? this.productsStatus : [],
                            fiscal: null
                        };

                        if (this.isFolio) {
                            this.api.voucher.postStatusVoucherStock(data).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
                                if (res) this.saveSuccessful();
                            });
                        } else if (!this.isAgro) {
                            this.api.voucher.postStatusVoucherAndRq(data).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
                                if (res) this.saveSuccessful();
                            })
                        } else {
                            this.api.voucher.postStatusVoucherAndRqAgro(data).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
                                if (res) this.saveSuccessful();
                            })
                        }
                    }
                })
        }

        if (this.statusSelected == "Finalizado") {
            const invoice = this.formNFactura.value;
            if (!invoice) return;
            let message = this.products ?
                "Una vez finalizado la compra y firmado de entregado, se dará de alta los productos en su respectivo Rancho, ¿Desea Continuar?" :
                "Una vez finalizado el servicio, el vale pasara a finalizado, ¿Desea continuar?";
            if (this.isAgro)
                message = "Una vez finalizado la compra, ya no se podra modificar el vale, ¿Desea continuar?";
            const dialogRef = this.dialog.open(DialogConfirmProducts, { data: { message } })
            dialogRef.afterClosed()
                .pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => {
                    if (value) {
                        // Finalizar vale, dar de alta en ranch_product
                        let id_vo = '';
                        let id = 0;
                        if (this.products) {
                            id_vo = String(this.dataSource.data[0].id_voucher);
                            id = Number(this.dataSource.data[0].id_voucher_id);
                        }
                        const requisition = new Requisition();
                        requisition.id = this.id_requisition;
                        requisition.status = EnumStatus.FINALIZADO;

                        // Datos solamente del vale;
                        const voucher = new Voucher();
                        voucher.id = id ? id : 0;
                        if (this.products) voucher.id_voucher = id_vo === '-1' ? '-1' : this.voucherSelected;
                        else {
                            voucher.id_voucher = '-2';
                            voucher.id = this.voucherFiscal.id_voucher;
                        }
                        voucher.id_folio = this.voucherSelected.toString();
                        voucher.status = EnumStatusVO.FINALIZADO;
                        // voucher.contra_recibo = this.formContrarecibo.value!!;

                        // Datos fiscales
                        this.voucherFiscal.ieps = this.formIEPS.value ? this.formIEPS.value : 0;
                        this.voucherFiscal.isr = this.formISR.value ? this.formISR.value : 0;
                        this.voucherFiscal.iva = this.IVA;
                        this.voucherFiscal.credit = this.credit;
                        this.voucherFiscal.id_invoice = invoice;
                        this.voucherFiscal.date = this.formatearFecha(this.dateControl.value!!);
                        this.voucherFiscal.date_invoice = this.formatearFecha(this.dateControlInvoice.value!!);
                        this.voucherFiscal.total = Number(this.total);

                        const data: RequestStatus = {
                            requisition: requisition,
                            voucher: voucher,
                            pdsStatus: this.products ? this.productsStatus : [],
                            fiscal: this.voucherFiscal
                        };
                        this.api.voucher.finishedVoucher(data).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
                            if (res) {
                                this.saveSuccessful();
                            }
                        })
                    }
                })
        }
    }

    private formatearFecha(fecha: Date): string {
        if (fecha) {
            const año = fecha.getFullYear();
            const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // +1 porque enero es 0
            const dia = String(fecha.getDate()).padStart(2, '0');
            return `${año}/${mes}/${dia}`;
        }
        return '';
    }

    private saveSuccessful() {
        const message = "Estatus guardado exitosamente."
        this.dialog.open(AlertDialogComponent, { data: { message, cancel: false, acept: true } });
        this.backToRequisitions();
    }

    getChecked(id_product: number) {
        const pd = this.productsStatus.find(v => v.id_product == id_product)
        return pd ? pd.check : false;
    }

    update(completed: boolean, id: number) {
        const current = this.productsStatus;
        const update = current.map(c =>
            c.id_product === id ? { id_product: c.id_product, check: completed, arrived: c.arrived, price: 0 } : { ...c }
        )
        this.productsStatus = update;
    }

    getRowClass(id_product: number): string {
        if (this.isAgro) return 'row-hability';
        const value = this.productsCancel.find(v => v.id_product === id_product);
        const count = this.productsStatus.filter(v => v.id_product === id_product).length;
        if (count > 1) {
            return 'row-hablity';
        }
        return value ? 'row-disabled' : 'row-hability';
    }

    changeVoucher() {
        this.setDataSource(this.voucherSelected);
    }

    handleErrorImage(event: Event) {
        event.preventDefault();
        this.previewUrl = null;
    }

    getPriority(value: number) {
        return getPriority(value);
    }

    formatDateEs(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
        return formatDateEs(date);
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
        const formData = new FormData();
        const name = `${this.id_requisition}-${this.voucherSelected}.png`;
        if (this.requisition.category == "Mantenimiento de vehículos" || this.requisition.category == "Maquinaria y equipo agrícola (Stock)")
            formData.append('category', "mantt");
        else formData.append('category', "shopping")
        formData.append('image', this.selectedFile, name);

        this.api.voucher.postImage(formData).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {

            const message = "Imagen guardada correctamente."
            this.dialog.open(AlertDialogComponent, { data: { message, cancel: false, accept: true } })
        })
    }

    updateComment(event: Event) {
        const valor = (event.target as HTMLInputElement).value;
        const value = String(valor);
        this.comment = value;
    }

    addComment() {
        if (!this.voucherSelected) return;
        const id: any[] = this.vouchersPrimary.find((v: any) => v[0] === this.voucherSelected);
        if (this.comment === '') return;
        const data: RequestComment = {
            id_voucher: id[1],
            comment: this.comment
        };
        this.api.voucher.addComment(data).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {

        });
        this.comments.push(this.comment);
        this.comment = "";
    }

    changeSupplier() {
        if (!this.voucherSelected || !this.requisition.id) return;
        let supplier = '';
        if (this.products) supplier = this.dataSource.data[0].supplier_name;
        else supplier = this.dataSource2.data[0].supplier_name;
        const data = {
            id_requisition: this.requisition.id,
            id_voucher: this.voucherSelected,
            supplier,
            type: this.isAgro
        }
        if (this.isAgro) {
            const voucher = this.voucherSelected.toString().split(',')[1];
            data.id_voucher = voucher;
        }
        const dialogRef = this.dialog.open(DialogSupplier, { data: data });
        dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(values => {
            if (values) {
                const message = values;
                const dialogRef2 = this.dialog.open(AlertDialogComponent, { data: { message, cancel: false, accept: true } })
                dialogRef2.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
                this.changeSupplierDataSource(message);
            }
        });
    }

    changeSupplierDataSource(message: string) {
        if (!message.includes(':')) return;
        const supplier = message.split(':')[1];
        if (this.products) {
            const current = this.dataSource.data;
            const updated = current.map((v: any) => ({
                ...v,                   // Copia todas las propiedades existentes
                supplier_name: supplier // Sobrescribe solo esta propiedad
            }));
            this.dataSource = new MatTableDataSource(updated);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
        } else {
            const current = this.dataSource2.data;
            const updated = current.map((v: any) => ({
                ...v,                   // Copia todas las propiedades existentes
                supplier_name: supplier // Sobrescribe solo esta propiedad
            }));
            this.dataSource2 = new MatTableDataSource(updated);
            this.dataSource2.paginator = this.paginator;
            this.dataSource2.sort = this.sort;
        }
    }
}

@Component({
    selector: 'dialog-confirm-products',
    imports: [MatButtonModule],
    template: `
    <div class="body">
        <p>{{data.message}}</p>
        <button matButton="tonal" (click)="cancel()" class="cancel">No</button>
        <button matButton="tonal" (click)="accept()">Sí</button>
    </div>
  `,
    styles: `
  .body{
    margin: 30px;
  }
  p{
    text-align:center;
    white-space: pre-line;
  }
  .cancel{
    margin-right: 20px;
  }
  `
})
export class DialogConfirmProducts {

    readonly dialogRef = inject(MatDialogRef<AlertDialogComponent>);
    readonly data = inject<any>(MAT_DIALOG_DATA);

    cancel() {
        this.dialogRef.close(false);
    }

    accept() {
        this.dialogRef.close(true);
    }

    onNoClick(): void {
        this.dialogRef.close(null);
    }
}

@Component({
    selector: 'dialog-suppliers',
    imports: [MatButtonModule, MatFormFieldModule, MatSelectModule, AsyncPipe, MatAutocompleteModule,
        ReactiveFormsModule, FormsModule, MatInputModule],
    template: `
        <div class="body">
            <h3>Seleccione al proveedor que cambiara</h3>
            <mat-form-field>
                <mat-label>Proveedores</mat-label>
                <input type="text" matInput [formControl]="formControl" [matAutocomplete]="autoProvDialog" />
                <mat-autocomplete #autoProvDialog="matAutocomplete">
                    @for(option of filteredSupplier$ | async; track option){
                    <mat-option [value]="option">
                        {{ option }}
                    </mat-option>
                    }
                </mat-autocomplete>
            </mat-form-field>
            <br>
            <button matButton="filled" (click) = "confirm()">Confrmar</button>
        </div>
    `,
    styles: `
        .body{
            text-align: center;
            margin: 30px;
        }
    `
})
class DialogSupplier {

    readonly dialogRef = inject(MatDialogRef<AlertDialogComponent>);
    readonly data = inject<any>(MAT_DIALOG_DATA);
    private readonly api = inject(Api);
    private destroyRef = inject(DestroyRef);
    suppliersAll: SupplierName[] = [];
    suppliers: string[] = [];
    filteredSupplier$: Observable<string[]>;
    formControl = new FormControl('');

    ngOnInit() {
        if (this.data) this.formControl.setValue(this.data.supplier);
        this.api.suppliers.get().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
            this.suppliersAll = Object(res);
            this.suppliers = this.suppliersAll.map(s => s.name);
            this.filteredSupplier$ = this.formControl.valueChanges.pipe(
                startWith(''),
                map(value => this.filterSupplier(value || ''))
            );
        });
    }

    confirm() {
        const value = this.formControl.value;
        if (!value) return;

        let supplier = this.suppliersAll.find(v => v.name === value);
        if (!supplier) {
            supplier = { id: 0, name: value };
        }

        const data = { ...this.data, ...supplier };
        this.api.voucher.changeSupplier(data).pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(res => {
                if (Object(res).error) {
                    this.dialogRef.close("Algo salió mal, intente de nuevo.");
                } else {
                    this.dialogRef.close("Modificación correcta, nuevo proveedor: " + supplier.name);
                }
            })
    }

    private filterSupplier(value: string): string[] {
        const filter = value.toLowerCase();
        return this.suppliers.filter(sp => sp.toLowerCase().includes(filter));
    }
}

interface SupplierName {
    id: number;
    name: string;
}

@Component({
    selector: 'dialog-change_voucher',
    imports: [ReactiveFormsModule, FormsModule, MatInputModule, MatButtonModule],
    template: `
        <div class="body">
            <mat-form-field appearance="outline">
                <mat-label>Nuevo numero de vale</mat-label>
                <input matInput [placeholder]="data" [(ngModel)]="newVoucher">
            </mat-form-field>
            <br>
            <button matButton="filled" (click)="save()">Guardar</button>
        </div>
    `,
    styles: `
        .body{
            text-align: center;
            margin: 30px;
        }
    `
})
class DialogChangeVoucher {

    newVoucher = "";
    readonly dialogRef = inject(MatDialogRef<DialogChangeVoucher>);
    readonly data = inject<string>(MAT_DIALOG_DATA);

    save() {
        this.dialogRef.close(this.newVoucher);
    }

}