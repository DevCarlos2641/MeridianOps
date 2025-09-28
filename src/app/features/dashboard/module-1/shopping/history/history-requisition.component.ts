import { Component, DestroyRef, inject, Input, ViewChild } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { provideNativeDateAdapter } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatDialog } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { Router } from "@angular/router";
import { takeUntil, debounceTime, distinctUntilChanged, Subject } from "rxjs";
import { Api } from "src/app/core/service/api.";
import { Data } from "src/app/core/service/data";
import { showProductsComponent } from "src/app/shared/component/show-products/show.products.component";
import { ResponseGetRequisitionFull } from "src/app/shared/model/dto/ResponseGetRequisitionFull";
import { SlugifyPipe } from "src/app/shared/pipes/SlugifyPipe";
import { getStatus, formatDateEs, getPriority } from "src/app/shared/util/FunctionsUtils";

@Component({
    selector: 'app-history-requisitions',
    imports: [MatTableModule, MatInputModule, MatButtonModule, ReactiveFormsModule, MatIconModule, MatPaginatorModule,
        MatSortModule, MatDatepickerModule, SlugifyPipe
    ],
    providers: [provideNativeDateAdapter()],
    templateUrl: './history-requisition.component.html',
    styleUrl: './history-requisition.component.scss'
})
export class HistoryRequisitionsComponent {

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    columns = ['date', 'id', 'category', 'enterprise', 'ranch', 'status', 'priority', 'comment', 'products', 'voucher', 'follow-up'];
    dataSource = new MatTableDataSource<ResponseGetRequisitionFull>([]);
    searchControl = new FormControl();
    searchByPd = new FormControl();

    rangeForm = new FormGroup({
        start: new FormControl<Date | null>(null),
        end: new FormControl<Date | null>(null),
    });

    private readonly api = inject(Api);
    private readonly data = inject(Data);
    private readonly dialog = inject(MatDialog);
    private readonly router = inject(Router);
    private destroyRef = inject(DestroyRef);

    ngOnInit() {
        this.searchByPd.setValue(this.data.termfHistory);

        this.data.requisitionsFullHistory.asObservable()
            .pipe(takeUntilDestroyed(this.destroyRef)).subscribe(dt => {
                this.setDataSource(dt);
            });
        this.searchControl.valueChanges.pipe(
            debounceTime(500),
            distinctUntilChanged()
        ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((term: string) => {
            this.applyFilter(term);
        });

        this.getRequisition();
    }

    getRequisition() {
        const dateH = this.data.dateHistory;
        if (dateH !== '') {
            const dateI = dateH.split('|')[0];
            const yy = Number(dateI.split('-')[0]);
            const mm = Number(dateI.split('-')[1]) - 1;
            const dd = Number(dateI.split('-')[2]);
            this.rangeForm.controls.start.setValue(new Date(yy, mm, dd));
            const dateF = dateH.split('|')[1];
            const yy2 = Number(dateF.split('-')[0]);
            const mm2 = Number(dateF.split('-')[1]) - 1;
            const dd2 = Number(dateF.split('-')[2]);
            this.rangeForm.controls.end.setValue(new Date(yy2, mm2, dd2));
            this.processDateRange(dateH.split('|')[0], dateH.split('|')[1]);
        } else {
            const date = new Date().toLocaleDateString('es-MX', {
                timeZone: 'America/Mexico_City', // Zona horaria de Guadalajara
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).split('/').reverse().join('-');
            const data = {
                start: date,
                end: date,
                term: `%${this.searchByPd.value}%`
            };
            this.api.requisition.getRequisitionFullHistory(data).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
                this.data.requisitionsFullHistory.set(res);
            });
        }
    }

    private setDataSource(dt: any) {
        this.dataSource = new MatTableDataSource(dt);
        this.dataSource.sortingDataAccessor = (item, property) => {
            switch (property) {
                case 'priority':
                    return this.getPriority(item.priority); // Ordena por texto como 'Alta', 'Media'
                case 'status':
                    return this.getStatus(item.status); // Igual, por texto visible
                case 'enterprise':
                    return item.enterprise_name?.toLowerCase() ?? '';
                case 'ranch':
                    return item.ranch_name?.toLowerCase() ?? '';
                default:
                    return (item as any)[property];
            }
        };
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        const filterValue = this.data.searchFilterHistory?.trim().toLowerCase() ?? '';
        this.searchControl.setValue(filterValue, { emitEvent: false });
        this.applyFilter(filterValue);
    }

    private applyFilter(term: string) {
        if (!term || term.trim() === '') {
            this.dataSource.filter = ''; // 🔄 mostrar todos
        } else {
            const value = term.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            this.dataSource.filter = value.trim().toLowerCase();
        }

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    ngOnDestroy() {
        this.data.requisitionsFullHistory.set([]);
    }

    searchByNmae() {
        const value = this.searchByPd.value ? this.searchByPd.value : '';
        this.getRequisition();
    }

    navigateToAssign(element: ResponseGetRequisitionFull) {
        const id = element.id;
        this.data.requisitionAssign = element;
        this.data.searchFilterHistory = this.searchControl.value;
        this.data.termfHistory = this.searchByPd.value;
        this.router.navigate(['dashboard/compras/asignar-vale', id]);
    }

    navigateToFollow(element: ResponseGetRequisitionFull) {
        if (element.ids_voucher) {
            const id = element.id;
            this.data.requisitionAssign = element;
            this.data.searchFilterHistory = this.searchControl.value;
            this.data.termfHistory = this.searchByPd.value;
            this.router.navigate(['dashboard/compras/seguimiento', id]);
        }
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

    showProducts(element: ResponseGetRequisitionFull) {
        if (element.category === "Mantenimiento de vehículos") {

            this.api.vehicle.getVehiclesByIdRequisition(element.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {

                const dialogRef = this.dialog.open(showProductsComponent, { data: { products: res, requisition: element } });
            })
        } else {

            this.api.products.getProductsByIdRequisition(element.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {

                const dialogRef = this.dialog.open(showProductsComponent, { data: { products: res.pds, requisition: element } });
            })
        }
    }

    backToRequisitions() {
        this.data.routerHistory = false;
        this.router.navigateByUrl('dashboard/compras/requisiciones');
    }

    onDateRangeSelected() {
        const startDate = this.rangeForm.value.start;
        const endDate = this.rangeForm.value.end;
        if (!startDate || !endDate) return;
        if (startDate > endDate) return;
        const startStr = this.formatDate(startDate);
        const endStr = this.formatDate(endDate);
        const date = `${startStr}|${endStr}`;
        this.data.dateHistory = date;
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
            end: end,
            term: `%${this.searchByPd.value}%`
        };
        this.api.requisition.getRequisitionFullHistory(data).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
            this.data.requisitionsFullHistory.set(res);
        })
    }
}