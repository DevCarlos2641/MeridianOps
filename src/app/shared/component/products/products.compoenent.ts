import { Component, DestroyRef, ElementRef, Inject, inject, Input, input, Optional, Renderer2, ViewChild } from "@angular/core";
import { FormControl, FormsModule, NgModel, NgModelGroup, ReactiveFormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatFormField, MatInputModule } from "@angular/material/input";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { debounceTime, distinctUntilChanged, Observable, Subject, takeUntil } from "rxjs";
import { Data } from "src/app/core/service/data";
import { Product, ProductOutput } from "../../model/Product";
import { MatButtonModule } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { DialogAmount } from "../dialogAmount/DialogAmount";
import { ProductNewOrUpdateComponent } from "../product-new-update/product-new-update.component";
import { EnumRole } from "../../model/TableSQL/EnumRole";
import { MatSelectModule } from "@angular/material/select";
import { Ranch } from "../../model/Ranch";
import { Api } from "src/app/core/service/api.";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { quitarTildes } from "../../util/FunctionsUtils";

@Component({
    selector: 'products-component',
    imports: [MatFormField, ReactiveFormsModule, MatInputModule, MatIconModule,
        MatTableModule, MatPaginatorModule, MatSortModule, MatButtonModule, MatSelectModule, FormsModule
    ],
    templateUrl: './products.component.html',
    styleUrl: './products.component.scss'
})
export class ProductsComponent {

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @Input() typeData: string = "products"
    @Input() columnsNewProducts = ['name', 'description', 'application', 'amount', 'amount_input', 'unit', 'expiration']

    deleteRow = false;
    searchControl = new FormControl();
    dataSource = new MatTableDataSource<Product>([]);
    showRanchs: boolean = false;
    ranchs: Ranch[] = [];
    currentRanch: Ranch;
    pdf = false;

    columns = ['name', 'description', 'application', 'unit', 'amount']
    private readonly dialog = inject(MatDialog);
    private readonly dataService = inject(Data);
    private readonly api = inject(Api);
    private destroyRef = inject(DestroyRef);

    constructor(
        @Optional() @Inject(MAT_DIALOG_DATA) private data: { columns: string[], type: string },
        @Optional() @Inject(MatDialogRef<ProductsComponent>) private dialogRef: any
    ) {
        if (data) this.columns = data.columns
    }

    ngOnInit(): void {
        this.searchControl.valueChanges.pipe(
            debounceTime(500),
            distinctUntilChanged()
        ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((term: string) => {
            const value = term.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            this.dataSource.filter = value.trim().toLowerCase();
            if (this.dataSource.paginator) {
                this.dataSource.paginator.firstPage();
            }
        });

        if (this.typeData == "products") {
            this.dataService.products.products$
                .pipe(takeUntilDestroyed(this.destroyRef)).subscribe(dt => {
                    this.updateTableData(dt)
                });
        }
        else if (this.typeData == "newProducts") {
            this.columns = this.columnsNewProducts;
            this.deleteRow = true;
            this.columns.push('Borrar');
            this.dataService.newProducts.asObservable()
                .pipe(takeUntilDestroyed(this.destroyRef)).subscribe(dt => {
                    this.updateTableData(dt)
                });
        }

        if (this.dataService.user.role == EnumRole.SHOPPING ||
            this.dataService.user.role == EnumRole.ADMIN ||
            this.dataService.user.role == EnumRole.MANTENIMIENTO ||
            this.dataService.user.role == EnumRole.AUXILIAR
        ) {
            this.showRanchs = true;
            this.api.users.getAllRanchs().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
                this.ranchs = res
                this.ranchs.unshift({ id: 0, name: 'Solo productos' });
            });
        }

        if (this.dataService.currentRanch) {
            this.currentRanch = this.dataService.currentRanch;
        }
        if (this.dataService.user.role == EnumRole.ADMIN)
            this.pdf = true;
    }

    updateTableData(dt: Product[]) {
        this.dataSource = new MatTableDataSource(dt);
        this.dataSource.filterPredicate = (data, filtro: string) => {
            const dataStr = Object.values(data).join(' ').toLowerCase();
            return quitarTildes(dataStr).includes(quitarTildes(filtro));
        };
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    formatCurrency(value: number): string {
        return value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
    }

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    handleAddNewProduct(row: Product) {
        if (this.typeData == "newProducts") return;
        const product = { ...row };
        if (this.typeData == "products" && !this.data) {
            // Actualza el producto
            const dialogRef = this.dialog.open(ProductNewOrUpdateComponent, { data: { product } });
            dialogRef.afterClosed()
                .pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
                    if (res) {
                        this.searchControl.setValue(this.searchControl.value, { emitEvent: true });
                    }
                })
            return;
        }

        if (this.data.type === 'baja') {
            if (this.dataService.productOutput.find(product.id)) return;
            const message = "Cantidad de salida";
            const dialogRef = this.dialog.open(DialogAmount, { data: message });
            dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(amount => {
                if (amount) {
                    const pd = new ProductOutput();
                    pd.id = product.id;
                    pd.application = product.application;
                    pd.description = product.description;
                    pd.name = product.name;
                    pd.unit = product.unit;
                    pd.amount = product.amount;
                    pd.amountOutput = amount;
                    pd.unit_for_product = product.unit_for_product;
                    if (pd.unit_for_product != 0) {
                        const total = pd.amount * pd.unit_for_product;
                        const result = Math.round((total - pd.amountOutput) * 100) / 100;
                        pd.left = result;
                    }
                    this.dataService.productOutput.add(pd);
                    this.dialogRef.close();
                }
            })
        }

        if(this.data.type === 'general'){
            this.dialogRef.close(row);
        }

        // if (this.dataService.newProducts.find(product.id)) return;
        // const message = "Ingrese la cantidad de la nueva mercancía"
        // this.dialog.open(DialogAmount, { data: message }).afterClosed()
        //     .pipe(takeUntilDestroyed(this.destroyRef)).subscribe(amount => {
        //         if (amount) {
        //             product.amount_input = amount;
        //             this.dataService.newProducts.add(product);
        //         }
        //     })
        // this.dialogRef.close();
    }

    handleUpdateProduct(row: Product) {
        if (this.typeData != "newProducts") return;
        const product = { ...row };
        const message = "Ingrese la cantidad de la nueva mercancía"
        this.dialog.open(DialogAmount, { data: message }).afterClosed()

            .pipe(takeUntilDestroyed(this.destroyRef)).subscribe(amount => {
                if (amount) {
                    this.dataService.newProducts.update(product.id, { amount_input: amount });
                }
            })
    }

    deleteItem(id: number) {
        this.dataService.newProducts.delete(id);
    }

    getTitle(value: string) {
        if (this.typeData == "newProducts") {
            if (value == "stock_local") return "Agregar Cantidad";
        }
        const translations: Record<string, string> = {
            'id': 'ID',
            'name': 'Nombre',
            'description': 'Descripción',
            'application': 'Aplicación',
            'amount': 'Existencias',
            'unit': 'Unidad de Medida',
            'resta': "Sobra",
            'amount_input': "Entrada"
        };

        return translations[value] || value;
    }

    changeProducts() {
        const id = this.currentRanch.id;
        this.api.products.getProductsByRanch(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
            this.dataService.currentRanch = this.currentRanch;
            this.dataService.products.setProducts(res);
        })
    }
}
