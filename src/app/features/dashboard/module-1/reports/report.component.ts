import { ChangeDetectionStrategy, Component, DestroyRef, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { provideNativeDateAdapter } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatDialog } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Api } from "src/app/core/service/api.";
import { Data } from "src/app/core/service/data";
import { AlertDialogComponent } from "src/app/shared/component/alert.dialog/alert.dialog.component";
import { Ranch } from "src/app/shared/model/Ranch";
import { EnumRole } from "src/app/shared/model/TableSQL/EnumRole";

@Component({
    selector: 'app-voucher-guard',
    imports: [MatInputModule, MatSelectModule, MatDatepickerModule, MatButtonModule, FormsModule, MatFormFieldModule, ReactiveFormsModule],
    templateUrl: './report.component.html',
    styleUrl: './report.component.scss',
    providers: [provideNativeDateAdapter()],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VoucherGuardComponent {
    products = "";
    type = "";
    readonly range = new FormGroup({
        start: new FormControl<Date | null>(new Date()),
        end: new FormControl<Date | null>(new Date()),
    });
    dateEnabled = false;
    ranchs: Ranch[] = [];
    currentRanch: Ranch;
    inventary = false;
    role: EnumRole;

    private readonly api = inject(Api);
    private readonly dialog = inject(MatDialog);
    private readonly data = inject(Data);
    private destroyRef = inject(DestroyRef);

    ngOnInit() {
        this.role = this.data.user.role;
        if (this.role == EnumRole.INVENTORY) {
            this.currentRanch = new Ranch();
            this.currentRanch.id = this.data.user.id_ranch;
            this.currentRanch.name = this.data.user.ranch_name;
            this.inventary = true;
            return;
        }
        this.api.users.getAllRanchs().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
            this.ranchs = res
        });
    }

    changeType() {
        if (this.type === 'stock') this.dateEnabled = true;
        else this.dateEnabled = false;
    }

    generar() {
        const fechaSqlStart = this.range.value.start!!.toLocaleDateString('en-CA', { // en-CA da formato YYYY-MM-DD
            timeZone: 'America/Mexico_City'
        });
        const fechaSqlEnd = this.range.value.end!!.toLocaleDateString('en-CA', { // en-CA da formato YYYY-MM-DD
            timeZone: 'America/Mexico_City'
        });
        if (this.products === '' || this.type === '') return;
        if (!this.currentRanch) return;

        const date = {
            start: fechaSqlStart,
            end: fechaSqlEnd
        };

        if (this.products === 'agro') {
            switch (this.type) {
                case 'stock':
                    this.api.products.getForReport(this.currentRanch.id, 1).subscribe(res => {
                        this.generarAgroStockAndPds(res);
                    });
                    break;
                case 'input':
                    this.api.products.getForreport2(this.currentRanch.id, 1, date)
                        .pipe(takeUntilDestroyed(this.destroyRef))
                        .subscribe(res => {
                            if (res.length === 0) {
                                const message = "No hay productos con esa fecha";
                                const dialogRef = this.dialog.open(AlertDialogComponent, { data: { message, cancel: false, accept: true } });
                                dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
                            } else {
                                this.generatePdf2(res, date);
                            }
                        })
                    break;
                case 'output':
                    this.api.products.getForreport3(this.currentRanch.id, 1, date)
                        .pipe(takeUntilDestroyed(this.destroyRef))
                        .subscribe(res => {
                            if (res.length === 0) {
                                const message = "No hay productos con esa fecha";
                                const dialogRef = this.dialog.open(AlertDialogComponent, { data: { message, cancel: false, accept: true } });
                                dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
                            } else {
                                this.generarPdf4(res, date);
                            }
                        })
                    break;
            }
        } else {
            switch (this.type) {
                case 'stock':
                    this.api.products.getForReport(this.currentRanch.id, 0)
                        .pipe(takeUntilDestroyed(this.destroyRef))
                        .subscribe(res => {
                            this.generarAgroStockAndPds(res);
                        });
                    break;
                case 'input':
                    this.api.products.getForreport2(this.currentRanch.id, 0, date)
                        .pipe(takeUntilDestroyed(this.destroyRef))
                        .subscribe(res => {
                            if (res.length === 0) {
                                const message = "No hay productos con esa fecha";
                                const dialogRef = this.dialog.open(AlertDialogComponent, { data: { message, cancel: false, accept: true } });
                                dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
                            } else {
                                this.generatePdf2(res, date);
                            }
                        })
                    break;
                case 'output':
                    this.api.products.getForreport3(this.currentRanch.id, 0, date)
                        .pipe(takeUntilDestroyed(this.destroyRef))
                        .subscribe(res => {
                            if (res.length === 0) {
                                const message = "No hay productos con esa fecha";
                                const dialogRef = this.dialog.open(AlertDialogComponent, { data: { message, cancel: false, accept: true } });
                                dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
                            } else {
                                this.generatePdf3(res, date);
                            }
                        })
                    break;
            }
        }
    }

    generarAgroStockAndPds(res: any) {
        const doc = new jsPDF();
        const fechaActual = new Date().toLocaleDateString('es-MX', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        doc.text(`Fecha: ${fechaActual}`, 14, 10); // arriba a la izquierda
        doc.text('Reporte de inventario - Rancho ' + this.currentRanch.name, 14, 15);
        let totalGeneral: number = 0;
        const headers = [['ID', 'Nombre', 'Cantidad', 'Descripción', 'Vencimiento', 'Precio', 'Total']];
        const data = res.map((p: any) => {
            totalGeneral += Number(p.total);
            if (this.role == EnumRole.INVENTORY)
                return [
                    p.id,
                    p.name,
                    p.amount,
                    p.description,
                    p.expiration,
                ];
            else {
                return [
                    p.id,
                    p.name,
                    p.amount,
                    p.description,
                    p.expiration,
                    this.formatCurrency(Number(p.unitary_price)),
                    this.formatCurrency(Number(p.total))
                ]
            }
        });

        if (this.role != EnumRole.INVENTORY)
            data.push([
                '', '', '', '', '', 'Total General', this.formatCurrency(totalGeneral)
            ]);

        autoTable(doc, {
            head: headers,
            body: data,
            startY: 25
        });

        doc.save('Reporte General.pdf');
    }

    generatePdf2(productos: any[], date: any) {
        const doc = new jsPDF();

        // Título
        doc.text(`Fecha: ${date.start} - ${date.end}`, 14, 10);

        // Estructura de tabla
        const head = [['Fecha', 'Folio', 'Producto', 'unit', 'Cantidad', 'Factura', 'Precio Unitario', 'Total']];
        let totalGeneral: number = 0;
        const body = productos.map(p => {
            totalGeneral += Number(p.total);
            return [
                p.date,
                p.id_voucher,
                p.name,
                p.unit || '-',
                p.arrived,
                p.invoice,
                this.formatCurrency(p.unitary_price),
                this.formatCurrency(p.total)
            ]
        });
        body.push([
            '', '', '', '', '', '', 'Total General', this.formatCurrency(totalGeneral)
        ]);

        autoTable(doc, {
            startY: 20,
            head: head,
            body: body,
            styles: {
                fontSize: 9
            },
            headStyles: {
                fillColor: [22, 160, 133],
                textColor: 255,
                halign: 'center'
            },
            columnStyles: {
                3: { halign: 'right' }, // Cantidad
                4: { halign: 'right' }, // Precio Unitario
                5: { halign: 'right' }, // Total
            }
        });

        // Abrir el PDF
        doc.save('Reporte de entrada.pdf'); // o .output() si quieres más control
    }

    generatePdf3(productos: any[], date: { start: string; end: string }) {
        const doc = new jsPDF();

        // Encabezado
        doc.setFontSize(12);
        doc.text('Reporte de Salidas Generales', 14, 15);
        doc.setFontSize(10);
        doc.text(`Fecha: ${date.start} - ${date.end}`, 14, 10);

        // Estructura de tabla
        const head = [['Fecha', 'Producto', 'Descripcion', 'Vehículo', 'Empleado', 'Cantidad', 'Precio Unitario', 'Total']];
        let totalGeneral = 0;

        const body = productos.map(p => {
            totalGeneral += Number(p.total);
            if (this.role == EnumRole.INVENTORY)
                return [
                    p.date,
                    p.name,
                    p.description,
                    p.economic_number || '-', // Puede ser NULL
                    p.name_employed || p.em_name || p.em || p.name_em || '-', // por si el alias varía
                    p.amount
                ]
            else
                return [
                    p.date,
                    p.name,
                    p.description,
                    p.economic_number || '-', // Puede ser NULL
                    p.name_employed || p.em_name || p.em || p.name_em || '-', // por si el alias varía
                    p.amount,
                    this.formatCurrency(Number(p.unitary_price)),
                    this.formatCurrency(Number(p.total))
                ];
        });

        // Fila de total general
        if (this.role != EnumRole.INVENTORY)
            body.push(['', '', '', '', '', '', 'Total General', this.formatCurrency(totalGeneral)]);

        // Generar la tabla
        autoTable(doc, {
            startY: 20,
            head: head,
            body: body,
            styles: {
                fontSize: 9
            },
            headStyles: {
                fillColor: [22, 160, 133],
                textColor: 255,
                halign: 'center'
            },
            columnStyles: {
                4: { halign: 'right' }, // Cantidad
                5: { halign: 'right' }, // Precio Unitario
                6: { halign: 'right' }  // Total
            }
        });

        doc.save('Reporte de salida.pdf');
    }

    generarPdf4(productos: any[], date: { start: string; end: string }) {
        const doc = new jsPDF();

        // Título y fecha
        doc.setFontSize(12);
        doc.text('Reporte de Salidas por Producto', 14, 15);
        doc.setFontSize(10);
        doc.text(`Fecha: ${date.start} - ${date.end}`, 14, 10);

        // Encabezados de la tabla
        const head = [['Fecha', 'Producto', 'Descripción', 'Cantidad', 'Unidad', 'Comentario', 'Total']];
        let totalGeneral = 0;

        // Cuerpo de la tabla
        const body = productos.map(p => {
            totalGeneral += Number(p.total);
            if (this.role == EnumRole.INVENTORY)
                return [
                    p.date,
                    p.name,
                    p.description || '-',
                    p.amount,
                    p.unit,
                    p.comment || '-',
                ]
            else
                return [
                    p.date,
                    p.name,
                    p.description || '-',
                    p.amount,
                    p.unit,
                    p.comment || '-',
                    this.formatCurrency(Number(p.total))
                ];
        });

        // Fila de total general
        if (this.role != EnumRole.INVENTORY)
            body.push(['', '', '', '', '', 'Total General', this.formatCurrency(totalGeneral)]);

        // Generar tabla con autoTable
        autoTable(doc, {
            startY: 20,
            head: head,
            body: body,
            styles: {
                fontSize: 9
            },
            headStyles: {
                fillColor: [22, 160, 133],
                textColor: 255,
                halign: 'center'
            },
            columnStyles: {
                3: { halign: 'right' }, // Cantidad
                5: { halign: 'right' }  // Total
            }
        });
        doc.save('Reporte de salida.pdf');
    }



    formatCurrency(value: number): string {
        if(!value) value = 0;
        return value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
    }
}