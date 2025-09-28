import { ChangeDetectionStrategy, Component, DestroyRef, Inject, inject, Input, Optional, ViewChild } from "@angular/core";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatTabsModule } from "@angular/material/tabs";
import { TraducirColumnaPipe } from "../../pipes/TraductorPipe";
import { Api } from "src/app/core/service/api.";
import { MatInputModule } from "@angular/material/input";
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from "rxjs";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatButtonModule } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatCheckbox, MatCheckboxModule } from "@angular/material/checkbox";
import { AlertDialogComponent } from "../alert.dialog/alert.dialog.component";
import { MatSelectModule } from "@angular/material/select";
import { Enterprise } from "../../model/Enterprise";
import { Vehicle } from "../../model/Vehicle";
import { StatusVehiclePipe } from "../../pipes/StatusVehicle";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { SlugifyPipe } from "../../pipes/SlugifyPipe";
import { MatDatepickerModule, MatDateRangePicker } from "@angular/material/datepicker";
import { provideNativeDateAdapter } from "@angular/material/core";
import { trigger, transition, style, animate } from "@angular/animations";
import { MatBadgeModule } from '@angular/material/badge';
import { Router } from "@angular/router";

@Component({
    selector: 'app-table-vehicle-maquinaria',
    imports: [MatTabsModule, MatTableModule, MatPaginatorModule, TraducirColumnaPipe, MatInputModule, FormsModule, MatIconModule, ReactiveFormsModule,
        MatSortModule, MatButtonModule, StatusVehiclePipe, SlugifyPipe, MatBadgeModule
    ],
    templateUrl: './Table-vehicle-maquinaria.component.html',
    styleUrl: './Table-vehicle-maquinaria.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
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
export class TableVehicleMaquinariaComponent {

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    dataSource: MatTableDataSource<any>;
    searchInput = new FormControl();
    data: Vehicle[] = [];
    columns = ['economic_number', 'ranch_name', 'plate', 'type', 'model', 'brand', 'responsible', 'active', 'info'];
    @Input() category: string;
    private readonly api = inject(Api);
    private readonly dialog = inject(MatDialog);
    private readonly router = inject(Router);

    private destroyRef = inject(DestroyRef);

    constructor(
        @Optional() @Inject(MAT_DIALOG_DATA) public info: { category: string },
        @Optional() @Inject(MatDialogRef<TableVehicleMaquinariaComponent>) private dialogRef: any
    ) {
        if (info && info.category) {
            this.category = info.category;
            this.api.vehicle.getByRanch().subscribe(res => {
                this.data = Object.values(res);
                this.setDatasource();
            })
        }
    }

    ngOnInit() {
        if (!this.info) {
            this.api.vehicle.getCategory(this.category).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
                this.data = Object.values(res);
                this.setDatasource();
            });
        }
        this.searchInput.valueChanges.pipe(
            debounceTime(500),
            distinctUntilChanged()
        ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((term: string) => {
            const value = term.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            this.dataSource.filter = value.trim().toLowerCase();
            if (this.dataSource.paginator)
                this.dataSource.paginator.firstPage();
        });
    }

    addNew() {
        const dialog = this.dialog.open(DialogUpdateOrNewVehicle, { data: { category: this.category } });
        dialog.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
            if (!res) return;
            if (String(res.message).includes("agrego")) {
                const dialog = this.dialog.open(AlertDialogComponent, { data: { message: res.message, cancel: false, accept: true } })
                dialog.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
                this.data.push(res.vehicle);
                this.setDatasource();
            }
        })
    }

    handleUpdate(id_vehicle: number) {
        if (this.info) return;
        const ve = this.data.find(v => v.id === id_vehicle);
        if (!ve) return;
        const dialog = this.dialog.open(DialogUpdateOrNewVehicle, { data: { vehicle: ve } })
        dialog.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
            if (res) {
                this.dialog.open(AlertDialogComponent, { data: { message: res.message, cancel: false, accept: true } })
                const vh = res.vehicle;
                this.data = this.data.map(v =>
                    v.id === vh.id ? { ...v, ...vh } : v
                );
                this.setDatasource();
            }
        })
    }

    handleVehicle(row: any) {
        if (this.info)
            if (this.info.category) {
                this.dialogRef.close(row)
            }
    }

    vehicleInfo(id: number){
        this.router.navigate(['dashboard/vehiculo', id]);
    }

    getHiden(item: any) {
        let targetDate;
        if (item.date_insurance) targetDate = new Date(item.date_insurance);
        else return true;
        const today = new Date();
        // Normaliza horas a 0 para evitar diferencias por hora
        targetDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        // Calcula la diferencia en milisegundos
        const diffTime = targetDate.getTime() - today.getTime();

        // Convierte a días
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        // Si faltan exactamente 30 o 31 días
        return diffDays > 0 && diffDays <= 30;
    }

    private setDatasource() {
        this.dataSource = new MatTableDataSource(this.data);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }
}


@Component({
    selector: 'dialog-updateOrNewVehicle',
    imports: [MatButtonModule, MatInputModule, MatIconModule, ReactiveFormsModule, MatCheckboxModule, MatSelectModule, MatDatepickerModule],
    providers: [provideNativeDateAdapter()],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
  <div class="container">
    <h2>Información del vehiculo</h2>
  <form [formGroup]="vehicleForm" class="form-container">
    @if(!this.data.vehicle){
    <mat-form-field>
        <mat-label>Empresa</mat-label>
        <mat-select [(value)]="currentEnterprise">
            @for (item1 of enterprises; track item1) {
            <mat-option [value]="item1">{{ item1.name }}</mat-option>
            }
        </mat-select>
    </mat-form-field>
    }

    <mat-form-field appearance="outline" class="full-width">
        <mat-label>Número económico</mat-label>
        <input matInput formControlName="economic_number" />
    </mat-form-field>

    <mat-form-field appearance="outline" class="full-width">
        <mat-label>Placa</mat-label>
        <input matInput formControlName="plate" />
    </mat-form-field>

    <mat-form-field appearance="outline" class="full-width">
        <mat-label>Tipo</mat-label>
        <input matInput formControlName="type" />
    </mat-form-field>

    <mat-form-field appearance="outline" class="full-width">
        <mat-label>Marca</mat-label>
        <input matInput formControlName="brand" />
    </mat-form-field>

    <mat-form-field appearance="outline" class="full-width">
        <mat-label>Modelo</mat-label>
        <input matInput formControlName="model" />
    </mat-form-field>

    <mat-form-field appearance="outline" class="full-width">
        <mat-label>Serie</mat-label>
        <input matInput formControlName="serie_n" />
    </mat-form-field>

    <mat-checkbox formControlName="active">
        Vehiculo Activo
    </mat-checkbox>
    <br>
    @if(vehicle){
    <mat-form-field>
        <mat-label>Choose a date</mat-label>
        <input matInput [matDatepicker]="picker" formControlName="date_insurance">
        <mat-hint>MM/DD/YYYY</mat-hint>
        <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
        <mat-datepicker #picker></mat-datepicker>
    </mat-form-field>

    <mat-form-field appearance="outline" class="full-width">
        <mat-label>Numero de póliza</mat-label>
        <input matInput formControlName="poliza" />
    </mat-form-field>

    <mat-form-field appearance="outline" class="full-width">
        <mat-label>Provedor</mat-label>
        <input matInput formControlName="provider" />
    </mat-form-field>
    }

    <br>
    <button matButton="tonal" (click)="saveVehicle()">Guardar</button>
    </form>
  </div>
  `,
    styles: `
  .container{
    margin: 20px;
    text-align: center;
  }
  .btn{
    margin-left: 20px
  }
  mat-form-field{
    margin: 10px
  }
  button{
    margin-top:20px
  }
  `
})
export class DialogUpdateOrNewVehicle {
    readonly dialogRef = inject(MatDialogRef<DialogUpdateOrNewVehicle>);
    readonly data = inject<any>(MAT_DIALOG_DATA);
    private readonly api = inject(Api);
    private destroyRef = inject(DestroyRef);
    amountControl = new FormControl();
    enterprises: any = [];
    vehicleForm: FormGroup;
    currentEnterprise: Enterprise;
    vehicle = false;

    constructor(private fb: FormBuilder) {
        this.vehicleForm = this.fb.group({
            economic_number: ['', Validators.required],
            plate: [''],
            type: ['', Validators.required],
            brand: [''],
            model: [''],
            serie_n: [''],
            active: [true], // booleano
            date_insurance: [''],
            poliza: [''],
            provider: ['']
        });
        if (this.data?.vehicle) {
            const vehicle = { ...this.data.vehicle };
            // Si `vehicle.fecha` es un string tipo '2025-07-05'
            if (vehicle.date_insurance) {
                const [year, month, day] = vehicle.date_insurance.split('-').map(Number);
                vehicle.date_insurance = new Date(year, month - 1, day); // esto ya es local
            }
            this.vehicleForm.patchValue(vehicle);
        } else {
            this.api.users.getEnterprises().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => this.enterprises = res);
        }
        if (this.data.vehicle) {
            if (this.data.vehicle.category === 'vehicle') this.vehicle = true;
        } else if (this.data.category === 'vehicle') this.vehicle = true;
    }

    parseDateAsLocal(dateStr: string): string {
        const [year, month, day] = dateStr.split('-').map(Number);
        const localDate = new Date(year, month - 1, day); // crea la fecha en local
        return localDate.toISOString().substring(0, 10);
    }

    onSubmit() {
        if (Number(this.amountControl.value))
            this.dialogRef.close(Number(this.amountControl.value));
    }

    saveVehicle() {
        if (this.vehicleForm.invalid) {
            this.vehicleForm.markAllAsTouched(); // Marca todos los campos para que se muestren los errores
            return;
        }
        const vehicleData = this.vehicleForm.value;
        if (this.data?.vehicle) vehicleData.id = this.data.vehicle.id;
        else {
            vehicleData.category = this.data.category;
            vehicleData.id_enterprise = this.currentEnterprise.id;
            vehicleData.id = 0;
        }
        if (vehicleData.id_enterprise === 1)
            vehicleData.ranch_name = "CALERAS Y CHILARES";

        if (vehicleData.id_enterprise === 2)
            vehicleData.ranch_name = "SALVIAL";

        if (vehicleData.id_enterprise === 3)
            vehicleData.ranch_name = "AGOSTO";

        if (vehicleData.id_enterprise === 4)
            vehicleData.ranch_name = "CANOAS";

        if (vehicleData.id_enterprise === 5)
            vehicleData.ranch_name = "INOCUIDAD";

        const fecha = new Date(vehicleData.date_insurance);
        // Formatear a yyyy/MM/dd
        const year = fecha.getFullYear();
        const month = String(fecha.getMonth() + 1).padStart(2, '0'); // Meses van de 0 a 11
        const day = String(fecha.getDate()).padStart(2, '0');
        const fechaFormateada = `${year}-${month}-${day}`; // "2025/07/05"
        vehicleData.date_insurance = fechaFormateada;

        // TODO mandar a la api la actualizacion o inset de vehiculo, asi tambien modificar el stock local
        this.api.vehicle.postVehicle(vehicleData).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
            if (!res.error) {
                if (Number(res.id) > 0) {
                    vehicleData.id = Number(res.id);
                    this.dialogRef.close({ message: "Se agrego correctamente", vehicle: vehicleData });
                }
                else {
                    this.dialogRef.close({ message: "Se modifico correctamente", vehicle: vehicleData });
                }
            }
        })
    }

}