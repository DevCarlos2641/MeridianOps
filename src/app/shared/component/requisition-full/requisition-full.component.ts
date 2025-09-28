import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { Component, DestroyRef, inject, Input, Pipe, PipeTransform, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { Api } from 'src/app/core/service/api.';
import { Data } from 'src/app/core/service/data';
import { showProductsComponent } from 'src/app/shared/component/show-products/show.products.component';
import { ResponseGetRequisitionFull } from 'src/app/shared/model/dto/ResponseGetRequisitionFull';
import { formatDateEs, getPriority, getStatus } from 'src/app/shared/util/FunctionsUtils';
import { SlugifyPipe } from '../../pipes/SlugifyPipe';
import { AlertDialogComponent } from '../alert.dialog/alert.dialog.component';

@Component({
    selector: 'app-requisition-full',
    imports: [MatTableModule, MatInputModule, MatButtonModule, ReactiveFormsModule, MatIconModule, MatPaginatorModule,
        MatSortModule, SlugifyPipe
    ],
    templateUrl: './requisition-full.component.html',
    styleUrl: './requisition-full.component.scss',
    providers: [provideNativeDateAdapter()],
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
export class RequisitionFullComponent {

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    @Input() type: string | 'incomplete';

    columns = ['delete', 'date', 'id', 'category', 'enterprise', 'ranch', 'status', 'priority', 'comment', 'products', 'voucher', 'follow-up'];
    dataSource = new MatTableDataSource<ResponseGetRequisitionFull>([]);
    searchControl = new FormControl();

    private readonly api = inject(Api);
    private readonly data = inject(Data);
    private readonly dialog = inject(MatDialog);
    private readonly router = inject(Router);

    private destroyRef = inject(DestroyRef);

    ngOnInit() {
        this.api.requisition.getRequisitionFull().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
            this.data.requisitionsFull.set(res);
        })
        this.data.requisitionsFull.asObservable()
            .pipe(takeUntilDestroyed(this.destroyRef)).subscribe(dt => {
                this.setDataSource(dt);
            })

        this.searchControl.valueChanges.pipe(
            debounceTime(500),
            distinctUntilChanged()
        ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((term: string) => {
            this.applyFilter(term);
        });

        // this.api.voucher.getCredit().subscribe(res => {

        // })
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
        const filterValue = this.data.searchFiltre?.trim().toLowerCase() ?? '';
        this.searchControl.setValue(filterValue, { emitEvent: false });
        this.applyFilter(filterValue);
    }

    navigateToHistory() {
        this.data.routerHistory = true;
        this.router.navigateByUrl('dashboard/compras/historial');
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
        this.data.requisitionsFull.set([]);
    }

    navigateToAssign(element: ResponseGetRequisitionFull) {
        const id = element.id;
        this.data.requisitionAssign = element;
        this.data.searchFiltre = this.searchControl.value;
        this.router.navigate(['dashboard/compras/asignar-vale', id]);
    }

    navigateToFollow(element: ResponseGetRequisitionFull) {
        if (element.ids_voucher) {
            const id = element.id;
            this.data.requisitionAssign = element;
            this.data.searchFiltre = this.searchControl.value;
            this.router.navigate(['dashboard/compras/seguimiento', id]);
        }
    }

    deleteItem(id: number, n: number) {
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
                        this.api.requisition.getRequisitionFull().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
                            this.data.requisitionsFull.set(res);
                        })
                        const message = `Se elimino la requisición N° ${n} correctamente`;
                        const dialofRef2 = this.dialog.open(AlertDialogComponent, { data: { message, cancel: false, accept: true } });
                        dialofRef2.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
                    }
                });
            });
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
}