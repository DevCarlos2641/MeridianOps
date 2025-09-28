import { Component, DestroyRef, inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { Api } from "src/app/core/service/api.";
import { Enterprise } from "../../model/Enterprise";
import { Ranch } from "../../model/Ranch";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { User } from "../../model/User";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
    selector: 'app-dialog-new-update-user',
    imports: [MatInputModule, MatSelectModule, ReactiveFormsModule, MatButtonModule],
    templateUrl: './userNewOrUpdate.component.html',
    styleUrl: './userNewOrUpdate.component.scss'
})
export class DialogUserNewOrUpdate {

    readonly dialogRef = inject(MatDialogRef<DialogUserNewOrUpdate>);
    readonly data = inject<any>(MAT_DIALOG_DATA);
    private readonly api = inject(Api);
    private readonly fb = inject(FormBuilder);

    enterprises: Enterprise[] = [];
    ranchs: Ranch[] = [];
    roles: string[] = ['Administrador', 'Petición de requisición', 'Compras', 'Mantenimiento', 'Inventario', 'Auxiliar', "Asistencias", "RH", 'Autorizaciones'];

    currentEnterprise: Enterprise;
    currentRanch: Ranch;
    currentRol = '';

    userForm = this.fb.group({
        name: ['', [Validators.required]],
        position: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]]
    });

    private destroyRef = inject(DestroyRef);

    ngOnInit() {
        this.api.users.getEnterprises().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => this.enterprises = res);
    }

    changeEnterprise(enterprise: Enterprise) {
        this.api.users.getRanchs(enterprise.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => this.ranchs = res);
    }

    private getRole() {
        if (this.currentRol === 'Administrador') return 0;
        if (this.currentRol === 'Petición de requisición') return 1;
        if (this.currentRol === 'Compras') return 2;
        if (this.currentRol === 'Inventario') return 3;
        if (this.currentRol === 'Mantenimiento') return 5;
        if (this.currentRol === 'Auxiliar') return 6;
        if (this.currentRol === 'Asistencias') return 7
        if (this.currentRol === 'RH') return 8;
        if (this.currentRol == 'Autorizaciones') return 9;
        else return 4;
    }

    submitForm() {
        if (this.currentRol === '') return;
        if (!this.currentEnterprise || !this.currentRanch) return;
        if (!this.userForm.valid) {
            this.userForm.markAllAsTouched();
            return;
        }

        const user = new User();
        user.id = 0;
        user.id_ranch = this.currentRanch.id;
        user.email = this.userForm.value.email!!.trim().toLowerCase();
        user.name = this.userForm.value.name!!.trim();
        user.position = this.userForm.value.position!!.trim();
        user.phone = this.userForm.value.phone!!;
        user.role = this.getRole();
        user.active = true;

        this.api.users.postUser(user).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
            const value = Object(res);
            if (value.error)
                alert(value.error);
            if (value.message)
                this.dialogRef.close(value.message);
        })
    }
}