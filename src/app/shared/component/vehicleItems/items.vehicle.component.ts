import { AsyncPipe } from "@angular/common";
import { Component, DestroyRef, ElementRef, inject, ViewChild } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { MatButtonModule } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatDividerModule } from "@angular/material/divider";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { map, Observable, startWith } from "rxjs";
import { Api } from "src/app/core/service/api.";

@Component({
    selector: 'itemas-vehicle',
    imports: [MatDividerModule, MatInputModule, MatButtonModule, MatIconModule, ReactiveFormsModule, MatAutocompleteModule, AsyncPipe],
    templateUrl: './items.vehicle.component.html',
    styleUrl: './items.vehicle.component.scss'
})
export class VehicleItemsComponent {

    readonly dialogRef = inject(MatDialogRef<VehicleItemsComponent>);
    readonly data = inject<string[]>(MAT_DIALOG_DATA);
    private readonly api = inject(Api);
    items: any[] = [];
    formcontrol = new FormControl('')
    @ViewChild('myInput') myInput: ElementRef;

    filteredServices$: Observable<string[]>;
    formControl = new FormControl('');
    services: string[];
    servicesAll: any[];

    ngOnInit() {
        if (this.data) this.items = this.data;
        this.api.vehicle.getServices().subscribe(res => {
            this.servicesAll = res;
            this.services = this.servicesAll.map(v => v.name);
            this.filteredServices$ = this.formControl.valueChanges.pipe(
                startWith(''),
                map(value => this.filterServices(value || ''))
            );
        });
    }

    private filterServices(value: string): string[] {
        const filter = value.toLowerCase();
        return this.services.filter(sp => sp.toLowerCase().includes(filter));
    }

    addItem() {
        const value = this.formControl.value;
        if (!value || value === '') return;
        const item = this.servicesAll.find(v=>v.name === value);
        if (item) this.items.push(item);
        else this.items.push({id:0, name: value});
        this.formControl.setValue('');
        this.myInput.nativeElement.focus();
    }

    finished() {
        this.dialogRef.close(this.items);
    }

    deleteItem(index: number) {
        this.items.splice(index, 1);
    }

}