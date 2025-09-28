import { Component, DestroyRef, inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { AlertDialogComponent } from "../alert.dialog/alert.dialog.component";
import { Api } from "src/app/core/service/api.";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatInputModule } from "@angular/material/input";
import { MatOptionModule } from "@angular/material/core";
import { map, Observable, startWith } from "rxjs";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { AsyncPipe } from "@angular/common";
import { MatSelectModule } from "@angular/material/select";
import { MatIconModule } from "@angular/material/icon";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
    selector: 'app-alert.dilog-search-supplier',
    imports: [MatButtonModule, MatInputModule, MatOptionModule, ReactiveFormsModule,
        MatSelectModule, MatAutocompleteModule, MatIconModule, AsyncPipe
    ],
    templateUrl: './search.supplier.component.html',
    styleUrl: './search.supplier.component.scss'
})
export class DialogSearchSupplier {

    readonly dialogRef = inject(MatDialogRef<AlertDialogComponent>);
    readonly data = inject<any>(MAT_DIALOG_DATA);
    private readonly api = inject(Api);

    filteredSupplier$: Observable<string[]>;
    formControl = new FormControl('');
    suppliers: string[];
    suppliersAll: suppliersAll[];

    supplierCurrent: string = '';

    private destroyRef = inject(DestroyRef);

    ngOnInit() {
        this.api.suppliers.get().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
            this.suppliersAll = Object(res);
            this.suppliers = this.suppliersAll.map(s => s.name);
            this.filteredSupplier$ = this.formControl.valueChanges.pipe(
                startWith(''),
                map(value => this.filterSupplier(value || ''))
            );
        })
    }

    private filterSupplier(value: string): string[] {
        const filter = value.toLowerCase();
        return this.suppliers.filter(sp => sp.toLowerCase().includes(filter));
    }

    submit() {
        const value = this.formControl.value;
        const supplier = this.suppliersAll.find(v => v.name === value);
        if (supplier) {
            this.dialogRef.close(supplier);
        }
    }
}

interface suppliersAll {
    id: number,
    name: string
}