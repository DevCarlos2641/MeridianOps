import { AsyncPipe, CurrencyPipe } from "@angular/common";
import { Component, DestroyRef, ElementRef, inject, ViewChild } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { MatButtonModule } from "@angular/material/button";
import { ActivatedRoute, Router } from "@angular/router";
import { BehaviorSubject, firstValueFrom, fromEvent, map, Observable, range } from "rxjs";
import { Api } from "src/app/core/service/api.";
import { Vehicle } from "src/app/shared/model/Vehicle";
import { MatExpansionModule } from '@angular/material/expansion';
import { RequestVouchersV } from "src/app/shared/model/dto/RequestVouchersV";
import { trigger, transition, style, animate } from "@angular/animations";
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { provideNativeDateAdapter } from "@angular/material/core";
import { MatInputModule } from "@angular/material/input";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatIcon } from "@angular/material/icon";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { AlertDialogComponent } from "src/app/shared/component/alert.dialog/alert.dialog.component";
import { environment } from "src/environments";
import { DialogEmployedComponent } from "src/app/shared/component/dialogEmployeds/dialog-employed.component";
import { Employed } from "src/app/shared/model/Employed";
import { Enterprise } from "src/app/shared/model/Enterprise";
import { MatSelectModule } from "@angular/material/select";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DatePipe } from "src/app/shared/pipes/DatePipe";
import html2canvas from "html2canvas";
import { MatDivider } from "@angular/material/divider";

@Component({
    selector: 'app-table-vehicle-maquinaria',
    imports: [AsyncPipe, MatButtonModule, CurrencyPipe, MatExpansionModule, ReactiveFormsModule, MatDatepickerModule,
        FormsModule, MatInputModule, MatCheckboxModule, MatIcon, DatePipe, MatDivider],
    providers: [provideNativeDateAdapter()],
    templateUrl: './vehicle.info.component.html',
    styleUrl: './vehicle.info.component.scss',
    animations: [
        trigger('rowAnim', [
            transition(':enter', [
                style({ opacity: 0 }),
                animate('150ms ease-in', style({ opacity: 1 }))
            ]),
            transition(':leave', [
                animate('150ms ease-out', style({ opacity: 0 }))
            ])
        ])
    ],
})
export class TableVehicleMaquinariaComponent {

    @ViewChild('image', { static: false }) vehicleImgRef!: ElementRef<HTMLImageElement>;
    @ViewChild('content', { static: false }) content!: ElementRef;

    private readonly route = inject(ActivatedRoute);
    private readonly api = inject(Api);
    private readonly destroyRef = inject(DestroyRef);
    private readonly dialog = inject(MatDialog);
    private readonly router = inject(Router);
    id_vehicle: number;
    employed: Employed;
    enterprise: Enterprise;
    private vehicleSubject = new BehaviorSubject<Vehicle | null>(null);
    vehicle$ = this.vehicleSubject.asObservable();
    vouchers$: Observable<RequestVouchersV[]> | null;
    totalGeneral$: Observable<number> | null;
    vehicleForm: FormGroup;
    rangeForm = new FormGroup({
        start: new FormControl<Date | null>(null),
        end: new FormControl<Date | null>(null),
    });
    rangeFormLisense = new FormGroup({
        start: new FormControl<Date | null>(null),
        end: new FormControl<Date | null>(null),
    });
    datePoliza: string;
    dateLisense: string;
    date = new Date();
    price: 0;
    showVoucher = false;

    urlImage = "";
    vouchersContainer = false;
    inforamtionContainer = true;
    selectedFile: File | null = null;
    previewUrl: string | ArrayBuffer | null = "https://api.meridianops.com/files/vehicles/urus.webp";

    constructor(private fb: FormBuilder) {
        this.vehicleForm = this.fb.group({
            economic_number: [''],
            plate: [''],
            type: [''],
            brand: [''],
            model: [''],
            serie_n: [''],
            active: [true],
            poliza: [''],
            provider: ['']
        });
    }

    ngOnInit() {
        this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
            this.id_vehicle = Number(params.get('id'));
            this.api.vehicle.getVehicle(this.id_vehicle).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
                this.vehicleSubject.next(res);
                this.employed = res.employed;
                this.enterprise = res.enterprise;
                this.setEnterprise(res.enterprise.name);
                this.vehicleForm.patchValue(res);
                if (res.date_insurance) {
                    const datesIn = res.date_insurance.split(',');
                    this.rangeForm.setValue({
                        start: this.parseDateToLocal(datesIn[0]),
                        end: this.parseDateToLocal(datesIn[1])
                    });
                    this.datePoliza = res.date_insurance;
                }
                if (res.date_lisense) {
                    const dateLi = res.date_lisense.split(',');
                    this.rangeFormLisense.setValue({
                        start: this.parseDateToLocal(dateLi[0]),
                        end: this.parseDateToLocal(dateLi[1])
                    });
                    this.dateLisense = res.date_lisense;
                }
            });
            this.previewUrl = `${environment.apiUrl}/files/vehicles/${this.id_vehicle}.webp?v=${Date.now()}`;
        });
    }

    setEnterprise(name: string) {
        if (name === 'MeridianOps') this.urlImage = "assets/logo.jpg";
        if (name === 'AVOAGO') this.urlImage = "assets/avoago.jpg";
        if (name === 'AVOCATS') this.urlImage = "assets/avocats.jpg";
        if (name === 'AGRONEV') this.urlImage = "assets/agronev.jpg";
        if (name === 'AGUABERRIES') this.urlImage = "assets/aguaberries.jpg";
    }

    parseDateToLocal(dateString: string): Date {
        // dateString formato esperado: 'YYYY-MM-DD'
        const parts = dateString.split('-');
        const year = Number(parts[0]);
        const month = Number(parts[1]) - 1; // mes base 0
        const day = Number(parts[2]);
        return new Date(year, month, day);
    }

    setDefaultImage() {
        this.previewUrl = "https://api.meridianops.com/files/vehicles/urus.webp"
    }

    getInformation() {
        if (this.inforamtionContainer) return;
        this.vouchersContainer = false;
        this.vouchers$ = null;
        this.totalGeneral$ = null;
        setTimeout(() => {
            this.inforamtionContainer = true;
        }, 150);
    }

    back() {
        this.router.navigate(['/dashboard/vehiculos-maquinaria']);
    }

    downloadPdf() {
        const imgEl = this.vehicleImgRef.nativeElement;
        const base64 = this.getBase64FromImageElement(imgEl);
        this.api.vehicle.getVouchers(this.id_vehicle).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(async res => {
            const vehicle = this.vehicleSubject.value;
            const total = res.reduce((acc, v) => acc + (v.total || 0), 0);
            if (!vehicle) return;
            const data = {
                Numero_Economico: vehicle.economic_number,
                Categoria: vehicle.category,
                Plate: vehicle.plate ?? '',
                Tipo: vehicle.type ?? '',
                Marca: vehicle.brand ?? '',
                Modelo: vehicle.model ?? '',
                Numero_Serie: vehicle.serie_n ?? '',
                Activo: vehicle.status,
                Fecha_De_Poliza: vehicle.date_insurance,
                Poliza: vehicle.poliza ?? '',
                Provedor_De_Poliza: vehicle.provider,
                Fecha_De_Licencia_Del_Conductor: vehicle.date_lisense,
                Total_En_Servicios: this.formatCurrency(total)
            }
            this.generateVehiclePdf(data, res, await base64);
        });
    }

    getServices() {
        if (this.vouchersContainer) return;
        this.inforamtionContainer = false;
        setTimeout(() => {
            this.vouchers$ = this.api.vehicle.getVouchers(this.id_vehicle).pipe(takeUntilDestroyed(this.destroyRef));
            this.totalGeneral$ = this.vouchers$.pipe(
                map(vouchers => vouchers.reduce((acc, v) => acc + (v.total || 0), 0))
            );
            this.vouchersContainer = true;
        }, 150);
    }

    onFileSelected(event: Event) {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file && file.type.startsWith('image/')) {
            this.selectedFile = file;

            const reader = new FileReader();
            fromEvent(reader, 'load').pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
                this.previewUrl = reader.result;
                const form = new FormData();
                form.append("id", this.id_vehicle.toString());
                form.append("image", this.selectedFile!!, `${this.id_vehicle}`);
                this.api.vehicle.postImage(form).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
                    if (res) {
                        let message;
                        if (res.message && res.message.error && res.message.error != '')
                            message = res.message.error;
                        else
                            message = res.message.message;
                        const dialogRef = this.dialog.open(AlertDialogComponent, { data: { message, cancel: false, accept: true } });
                        dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
                    }
                });
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

    save() {
        const vehicle: Vehicle = Object.assign(new Vehicle(), this.vehicleForm.value);
        vehicle.date_insurance = this.datePoliza;
        vehicle.date_lisense = this.dateLisense;
        vehicle.id_employed = this.employed ? this.employed.id : 0;
        vehicle.id = this.id_vehicle;
        vehicle.enterprise = this.vehicleSubject.value?.enterprise!!;
        vehicle.employed = this.vehicleSubject.value?.employed!!;
        vehicle.category = this.vehicleSubject.value?.category!!;
        this.api.vehicle.putVehicle(vehicle).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
            if (res) {
                const message = "Vehículo modificado correctamente";
                const dialogRef = this.dialog.open(AlertDialogComponent, { data: { message, cancel: false, accept: true } });
                dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
                this.vehicleSubject.next(vehicle);
            }
        })
    }

    changeEmployed() {
        const dialog = this.dialog.open(DialogEmployedComponent, { data: { complete: true } });
        dialog.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
            if (res) this.employed = res;
        })
    }

    onDateRangeSelected() {
        const startDate = this.rangeForm.value.start;
        const endDate = this.rangeForm.value.end;
        if (!startDate || !endDate) return;
        if (startDate > endDate) return;
        const startStr = this.formatDate(startDate);
        const endStr = this.formatDate(endDate);
        const date = `${startStr},${endStr}`;
        this.datePoliza = date;
    }

    onDateRangeSelectedLisense() {
        const startDate = this.rangeFormLisense.value.start;
        const endDate = this.rangeFormLisense.value.end;
        if (!startDate || !endDate) return;
        if (startDate > endDate) return;
        const startStr = this.formatDate(startDate);
        const endStr = this.formatDate(endDate);
        const date = `${startStr},${endStr}`;
        this.dateLisense = date;
    }

    // Función para formatear Date a yyyy-mm-dd
    private formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    transfer() {
        const dialogRef = this.dialog.open(DialogTransfer, { data: this.enterprise });
        // Value retorna: {id: number, name: string}
        dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => {
            if (!value) return;
            this.enterprise = value;
            const vehicle = this.vehicleSubject.value;
            if (!vehicle) return;
            const updateV = {
                ...vehicle,
                id_enterprise: value.id,
                enterprise: {
                    ...vehicle.enterprise,
                    id: value.id,
                    name: value.name
                }
            }
            this.vehicleSubject.next(updateV);
            this.api.vehicle.patchVehicle(value, updateV.id).subscribe(res => {
                if (!res) return;
                const message = "Cambio de empresa exitosamente";
                const dialogRef2 = this.dialog.open(AlertDialogComponent, { data: { message, cancel: false, accept: true } });
                dialogRef2.afterOpened().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
            });
        });
    }

    generatePDF() {
        const data = this.content.nativeElement;
        html2canvas(data, {
            scale: 2,
            useCORS: true,
            logging: true,
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/jpeg', 0.7);
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'letter', // 216 x 279 mm
            });

            const pageWidth = 210;   // contenido útil dentro de carta
            const pageHeight = 279;

            const imgProps = pdf.getImageProperties(imgData);
            const originalImgWidth = imgProps.width;
            const originalImgHeight = imgProps.height;

            const aspectRatio = originalImgHeight / originalImgWidth;

            // Ajustamos para que DOS imágenes quepan verticalmente en la misma hoja
            const maxImgHeight = pageHeight / 2; // dividimos en 2 partes iguales
            const scaledWidth = pageWidth;
            const scaledHeight = scaledWidth * aspectRatio;

            // Si la altura es muy grande, reducimos hasta que quepa 2 veces
            const finalHeight = scaledHeight > maxImgHeight ? maxImgHeight : scaledHeight;

            pdf.addImage(imgData, 'JPEG', 0, 0, scaledWidth, finalHeight);
            pdf.addImage(imgData, 'JPEG', 0, finalHeight, scaledWidth, finalHeight);

            pdf.save('documento.pdf');
        });
    }

    async generateVehiclePdf(vehicle: any, vouchers: any[], logoBase64: string) {
        const doc = new jsPDF();

        // Reducir tamaño de la imagen antes de insertarla
        doc.setFontSize(16);
        doc.text('Datos del vehículo', 75, 10);
        const resizedImage = await this.resizeBase64Image(logoBase64, 400, 0.7);

        // Insertar imagen centrada y sin deformar
        await this.addImageScaled(doc, resizedImage, 50, 20, 100);

        // Filtrar campos nulos
        const nullFields = Object.keys(vehicle)
            .filter(key => vehicle[key] != '')
            .map(key => [this.formatFieldName(key), vehicle[key]]);
        // Tabla de datos nulos
        if (nullFields.length > 0) {
            autoTable(doc, {
                head: [['Campo', 'Valor']],
                body: nullFields,
                startY: 110,
                theme: 'striped',
                headStyles: { fillColor: [76, 175, 80], textColor: 255 },
            });
        } else {
            doc.setFontSize(12);
            doc.text('No hay datos nulos.', 14, 50);
        }

        // Sección de vales
        let currentY = (doc as any).lastAutoTable?.finalY || 60;
        doc.setFontSize(16);
        doc.text('Vales', 14, currentY + 10);


        const body = vouchers.map((v) => {
            // Concatenamos servicios en varias líneas
            const services = v.services?.length > 0
                ? v.services.map((s: string) => `• ${s}`).join("\n")
                : "N/A";

            return [
                v.id_folio,
                this.formatCurrency(v.total),
                v.id_invoice,
                v.supplier_name,
                services
            ];
        });

        autoTable(doc, {
            head: [["Vale", "Total", "Factura", "Proveedor", "Servicios"]],
            body,
            startY: currentY + 20, // margen superior
            styles: {
                fontSize: 10,
                cellPadding: 3,
            },
            headStyles: {
                fillColor: [22, 160, 133], // Verde
                textColor: 255,
                halign: "center",
            },
            columnStyles: {
                0: { halign: "center", cellWidth: 20 }, // Vale
                1: { halign: "right", cellWidth: 30 },  // Total
                2: { halign: "center", cellWidth: 30 }, // Factura
                3: { cellWidth: 40 },                   // Proveedor
                4: { cellWidth: 60 },                   // Servicios
            },
        });


        // Abrir PDF
        doc.save('vehiculo.pdf');
    }

    private resizeBase64Image(base64: string, maxWidth: number, quality: number = 0.7): Promise<string> {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = base64;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d')!;
                const aspectRatio = img.width / img.height;
                canvas.width = maxWidth;
                canvas.height = maxWidth / aspectRatio;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
        });
    }

    private addImageScaled(doc: jsPDF, imgBase64: string, x: number, y: number, maxWidth: number) {
        const img = new Image();
        img.src = imgBase64;
        return new Promise<void>((resolve) => {
            img.onload = () => {
                const aspectRatio = img.width / img.height;
                const newWidth = maxWidth;
                const newHeight = newWidth / aspectRatio;
                doc.addImage(imgBase64, 'PNG', x, y, newWidth, newHeight);
                resolve();
            };
        });
    }

    private formatCurrency(value: number) {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
    }

    private formatFieldName(field: string) {
        return field.replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    }

    getBase64FromImageElement(imgElement: HTMLImageElement): string {
        const canvas = document.createElement('canvas');
        canvas.width = imgElement.naturalWidth;
        canvas.height = imgElement.naturalHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) return '';

        ctx.drawImage(imgElement, 0, 0);
        return canvas.toDataURL('image/png'); // devuelve Base64
    }
}

@Component({
    selector: 'tansfer-vehicle',
    imports: [MatSelectModule, MatButtonModule],
    template: `
        <div class="body">
            <p> <span class="enterprise"> Empresa actual: </span> {{data.name}} </p>
            <br>
            <p>Tranferir a...</p>

            <mat-form-field>
                <mat-label>Empresa</mat-label>
                <mat-select [(value)]="currentEnterprise">
                    @for (item1 of enterprises; track item1) {
                    <mat-option [value]="item1">{{ item1.name }}</mat-option>
                    }
                </mat-select>
                @if(currentEnterprise){
                <mat-hint>{{currentEnterprise.name}}</mat-hint>
                }
            </mat-form-field>

            <br>
            <br>
            <button matButton="filled" (click)="save()">Guardar</button>
        </div>
    `,
    styles: `
        .body{
            text-align: center;
            margin: 20px;
            p{
                font-size: large;
            }
        }
        .enterprise{
            font-weight: 600;
        }
    `
})
class DialogTransfer {

    private readonly api = inject(Api);
    private readonly destroyRef = inject(DestroyRef);
    readonly dialogRef = inject(MatDialogRef<DialogTransfer>);
    readonly data = inject<Enterprise>(MAT_DIALOG_DATA);
    enterprises: Enterprise[] = [];
    currentEnterprise: Enterprise;

    ngOnInit() {
        this.api.users.getEnterprises().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => this.enterprises = res);
    }

    save() {
        if (!this.currentEnterprise) return;
        const id = this.currentEnterprise.id;
        const currentId = this.data.id;
        if (id === currentId) return;
        this.dialogRef.close(this.currentEnterprise);
    }
}

// interface TranferData(){
//     enterprise: Enterprise;
// }