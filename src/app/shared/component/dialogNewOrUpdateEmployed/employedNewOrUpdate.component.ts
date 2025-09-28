import { Component, DestroyRef, inject } from "@angular/core";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from "@angular/material/dialog";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { Api } from "src/app/core/service/api.";
import { Employed } from "../../model/Employed";
import { AlertDialogComponent } from "../alert.dialog/alert.dialog.component";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Enterprise } from "../../model/Enterprise";
import { MatCheckboxModule } from "@angular/material/checkbox";

@Component({
    selector: 'app-dialog-new-update-employed',
    imports: [MatInputModule, MatSelectModule, ReactiveFormsModule, MatButtonModule, MatCheckboxModule],
    templateUrl: './employedNewOrUpdate.component.html',
    styleUrl: './employedNewOrUpdate.component.scss'
})
export class DialogEmployedNewOrUpdate {

    readonly dialogRef = inject(MatDialogRef<DialogEmployedNewOrUpdate>);
    readonly data = inject<any>(MAT_DIALOG_DATA);
    readonly dialog = inject(MatDialog);
    private readonly api = inject(Api);
    private readonly fb = inject(FormBuilder);

    title: string = "";

    private destroyRef = inject(DestroyRef);
    currentEnterprise: Enterprise;
    enterprises: Enterprise[] = [];
    employedForm = this.fb.group({
        name: ['', [Validators.required]],
        position: ['', [Validators.required]],
        email: [''],
        phone: [''],
        username: [''],
        active: [true],
        password: [''],
    });

    ngOnInit() {
        if (this.data.mode == 0) this.title = "Nuevo Empleado"
        else this.title = "Modificar Empleado"

        if (this.data.employed) {
            this.employedForm.patchValue(this.data.employed);
        }
        this.api.users.getEnterprises().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => this.enterprises = res);
    }

    submitForm() {
        if (!this.employedForm.valid) {
            this.employedForm.markAllAsTouched();
            return;
        }
        const employed = new Employed();
        employed.id = this.data?.employed?.id ?? 0;
        employed.id_enterprise = this.currentEnterprise?.id ?? 0;
        employed.name = this.employedForm.value.name?.trim() ?? '';
        employed.position = this.employedForm.value.position?.trim() ?? '';
        employed.email = this.employedForm.value.email?.trim().toLowerCase() ?? '';
        employed.active = this.employedForm.value.active ?? true;
        employed.phone = this.employedForm.value.phone ?? '';
        employed.username = this.employedForm.value.username?.trim().toLowerCase() ?? '';
        employed.password = this.employedForm.value.password?.trim() ?? '';

        if (this.data.mode == 1) {
            this.api.users.putEmployed(employed).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
                const value = Object(res);
                if (value.error) {
                    const message = "Algo salio mal, intente de nuevo";
                    this.dialog.open(AlertDialogComponent, { data: { message, cancel: false, accept: true } })
                    return;
                }

                const message = "Usuario modificado correctamente";
                this.dialog.open(AlertDialogComponent, { data: { message, cancel: false, accept: true } })
                this.dialogRef.close(employed);
            })
        } else {
            this.api.users.postEmployed(employed).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
                const value = Object(res);
                if (value.error) {
                    const message = "Algo salio mal, intente de nuevo";
                    this.dialog.open(AlertDialogComponent, { data: { message, cancel: false, accept: true } })
                    return;
                }
                const message = "Usuario dado de alta correctamente";
                this.dialog.open(AlertDialogComponent, { data: { message, cancel: false, accept: true } })
                this.dialogRef.close(employed);
            })
        }
    }
}