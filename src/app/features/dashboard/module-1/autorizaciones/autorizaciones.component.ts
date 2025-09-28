import { trigger, transition, style, animate } from "@angular/animations";
import { Component, DestroyRef, inject, Input, ViewChild } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatDialog } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { debounceTime, distinctUntilChanged } from "rxjs";
import { Api } from "src/app/core/service/api.";
import { AlertDialogComponent } from "src/app/shared/component/alert.dialog/alert.dialog.component";
import { showProductsComponent } from "src/app/shared/component/show-products/show.products.component";
import { ResponseGetRequisitionFull } from "src/app/shared/model/dto/ResponseGetRequisitionFull";
import { DatePipe } from "src/app/shared/pipes/DatePipe";
import { SlugifyPipe } from "src/app/shared/pipes/SlugifyPipe";
import { getPriority, getStatus } from 'src/app/shared/util/FunctionsUtils';

@Component({
    selector: 'app-autorizaciones',
    imports: [MatInputModule, MatFormFieldModule, ReactiveFormsModule, MatPaginatorModule, MatSortModule, MatTableModule, MatIconModule,
        DatePipe, SlugifyPipe, MatButtonModule
    ],
    templateUrl: './autorizaciones.component.html',
    styleUrl: './autorizaciones.component.scss',
    animations: [
        trigger('rowAnim', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(-5px)' }),
                animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
            ]),
            transition(':leave', [
                animate('150ms ease-in', style({ opacity: 0, transform: 'translateY(5px)' }))
            ])
        ])
    ]
})
export class AutorizacionesComponent {

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    @Input() type: string | 'incomplete';

    columns = ['date', 'id', 'category', 'enterprise', 'ranch', 'status', 'priority', 'comment', 'products', 'auth'];
    dataSource = new MatTableDataSource<ResponseGetRequisitionFull>([]);
    searchControl = new FormControl();
    private destroyRef = inject(DestroyRef);
    private readonly dialog = inject(MatDialog)

    private readonly api = inject(Api);

    ngOnInit() {
        this.api.requisition.getRequisitionFull().subscribe(res => {
            this.setDataSource(res);
        })
        this.searchControl.valueChanges.pipe(
            debounceTime(500),
            distinctUntilChanged()
        ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((term: string) => {
            this.applyFilter(term);
        });
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
    }

    getPriority(value: number) {
        return getPriority(value);
    }

    getStatus(value: number) {
        return getStatus(value)
    }

    autorizar(id: number) {
        const message = "Está a punto de autorizar la requisición, ¿Desea continuar?";
        const dialogRef = this.dialog.open(AlertDialogComponent, { data: { message, cancel: true, accept: true } })
        dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(v => {
            if (!v) return;
            this.api.requisition.authorize(id).subscribe(res => {
                if (res) {
                    const message = "Autorización completa";
                    const dialogRef = this.dialog.open(AlertDialogComponent, { data: { message, cancel: false, accept: true } })
                    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
                    const current = this.dataSource.data;
                    const update = current.filter(v=>v.id !== id);
                    this.setDataSource(update);
                }
            })
        })
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
}