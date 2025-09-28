import { ChangeDetectionStrategy, Component, DestroyRef, Inject, inject, Optional } from "@angular/core";
import { FormControl, FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { map, startWith, takeUntil } from 'rxjs/operators';
import { AsyncPipe, CommonModule } from '@angular/common';
import { fromEvent, Observable, Subject } from "rxjs";
import { Data } from "src/app/core/service/data";
import { MatButtonModule } from "@angular/material/button";
import { Product } from "../../model/Product";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { AlertDialogComponent } from "../alert.dialog/alert.dialog.component";
import { Api } from "src/app/core/service/api.";
import { MatSelectModule } from "@angular/material/select";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { MatRadioModule } from '@angular/material/radio';
import { environment } from "src/environments";

@Component({
    selector: 'product-new-update',
    imports: [MatInputModule, ReactiveFormsModule, MatAutocompleteModule, AsyncPipe, MatButtonModule, MatSelectModule, MatRadioModule,
        FormsModule
    ],
    templateUrl: './poduct-new-update.component.html',
    styleUrl: './poduct-new-update.component.scss',
})
export class ProductNewOrUpdateComponent {

    private readonly fb = inject(NonNullableFormBuilder);
    private readonly dialog = inject(MatDialog);
    private readonly dataService = inject(Data);
    private readonly api = inject(Api);

    units: string[];
    applys: string[];
    houses: string[];
    housesIds: any[];
    filteredUnits$: Observable<string[]>;
    filteredApplys$: Observable<string[]>;
    filteredHouse$: Observable<string[]>;
    formControl = new FormControl();
    isAgro = false;
    type: string;
    update = false;
    previewUrl: string | ArrayBuffer | null;
    selectedFile: File | null = null;

    form = this.fb.group({
        name: ['', Validators.required],
        description: [''],
        application: [''],
        amount: 0,
        unit: ['', Validators.required],
    });

    constructor(
        @Optional() @Inject(MAT_DIALOG_DATA) private data: { product: Product, isAgro: boolean },
        @Optional() @Inject(MatDialogRef<ProductNewOrUpdateComponent>) private dialogRef: any) {
        if (data) {
            this.update = true;
            const pd = data.product;
            this.previewUrl = `${environment.apiUrl}/files/products/${pd.id}.webp?v=${Date.now()}`
            this.form.reset({
                name: pd.name,
                description: pd.description,
                application: pd.application,
                amount: pd.amount,
                unit: pd.unit,
            })
        }
    }

    private destroyRef = inject(DestroyRef);

    ngOnInit() {
        this.dataService.products.products$
            .pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
                this.units = this.dataService.products.getUnits();
                this.applys = this.dataService.products.getApplication();
                this.filteredUnits$ = this.form.controls.unit.valueChanges.pipe(
                    startWith(''),
                    map(value => this.filterUnits(value || ''))
                );
                this.filteredApplys$ = this.form.controls.application.valueChanges.pipe(
                    startWith(''),
                    map(value => this.filterApplys(value || '')
                    )
                )
            });

        this.api.suppliers.getHouse().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
            this.housesIds = Object.values(res);
            this.houses = Object.values(res).map(v => v.name);
            this.filteredHouse$ = this.formControl.valueChanges.pipe(
                startWith(''),
                map(value => this.filterHouses(value || ''))
            );
        })
        if (this.data) {
            this.type = this.data.product.type;
            if (this.data.product.house_name) {
                this.formControl.setValue(this.data.product.house_name);
            }
            this.isAgro = this.data.isAgro;
        }
    }

    setDefaultImage() {
        this.previewUrl = "assets/image.png"
    }

    onFileSelected(event: Event) {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file && file.type.startsWith('image/')) {
            this.selectedFile = file;

            const reader = new FileReader();
            fromEvent(reader, 'load').pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
                this.previewUrl = reader.result;
                const form = new FormData();
                form.append("id", this.data.product.id.toString());
                form.append("image", this.selectedFile!!, `${this.data.product.id}`);
                this.api.products.postImage(form).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
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

    private filterHouses(value: string): string[] {
        const filter = value.toLowerCase();
        return this.houses.filter(sp => sp.toLowerCase().includes(filter));

    }

    private filterUnits(value: string): string[] {
        const filter = value.toLowerCase();
        return this.units.filter(unit => unit.toLowerCase().includes(filter));
    }

    private filterApplys(value: string): string[] {
        const filter = value.toLowerCase();
        return this.applys.filter(ap => ap.toLocaleLowerCase().includes(filter));
    }

    submit() {
        if (!this.form.valid) return this.form.markAllAsTouched();
        const product = this.parseProduct();
        const conflict = this.existProduct(product);
        if (conflict) {
            this.dialog.open(AlertDialogComponent, {
                data: { message: conflict, cancel: false, accept: true }
            });
            return;
        };

        if (this.data) {
            const messageAlert = "Está a punto de modificar este producto, ¿Desea continuar?"
            const message = "Producto modificado correctamente"
            this.updateOrNewProduct(messageAlert, message, ProductMode.UPDATE, product);
        } else {
            const messageAlert = "Está a punto de agregar un nuevo producto, ¿Desea continuar?"
            const message = "Producto agregado correctamente"
            this.updateOrNewProduct(messageAlert, message, ProductMode.CREATE, product);
        }
    }

    updateOrNewProduct(messageAlert: string, message: string, mode: ProductMode, product: Product) {
        const house = this.housesIds.find(v => v.name === this.formControl.value);
        const dialogOpen = this.dialog.open(AlertDialogComponent, {
            data: { message: messageAlert, cancel: true, accept: true }
        });

        dialogOpen.afterClosed()

            .pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => {
                if (value) {
                    if (mode == ProductMode.CREATE) {
                        this.api.products.postProduct(product).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
                            if (res) {
                                const value = Object(res);
                                product.id = value.id_product;
                                this.dataService.products.add(product);
                                this.dialog.open(AlertDialogComponent, { data: { message, cancel: false, accept: true } })
                                this.form.reset({
                                    name: '',
                                    description: '',
                                    application: '',
                                    amount: 0,
                                    unit: '',
                                });
                            }
                        })
                    } else {
                        if (!product.expiration) product.expiration = "";
                        product.house = house ? house.name : this.formControl.value;
                        this.api.products.updateProduct(product).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
                            const value = Object(res);
                            if (value.error) alert("Ya existe un producto con ese nombre y descripción");
                            else {
                                this.dataService.products.update(product)
                                this.dialog.open(AlertDialogComponent, { data: { message, cancel: false, accept: true } })
                                this.dialogRef.close(product);
                            }
                        })
                    }
                }
            })
    }

    parseProduct(): Product {
        let id = 0;
        if (this.data) id = this.data.product.id;
        const product = Object.assign(new Product(), this.form.getRawValue());
        product.id = id;
        product.id_ranch = this.dataService.user.id_ranch
        product.amount = product.amount;
        product.type = this.type;

        if (!this.units.includes(product.unit))
            this.units.push(product.unit);
        if (!this.applys.includes(product.application))
            this.applys.push(product.application);
        return product;
    }

    existProduct(product: Product): string | null {
        const existProduct = this.dataService.products.getByNameAndDesc(product.name, product.description);
        if (existProduct?.id == product.id) return null;    // is update
        if (existProduct) return "Producto existente con ese nombre.";
        return null;
    }

}

enum ProductMode {
    CREATE,
    UPDATE
}