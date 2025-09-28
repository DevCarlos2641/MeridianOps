import { Component, DestroyRef, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl, FormsModule, NgForm, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatIcon, MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { fromEvent, Subject, takeUntil } from "rxjs";
import { Api } from "src/app/core/service/api.";
import { Data } from "src/app/core/service/data";
import { LoadingDialogService } from "src/app/core/service/loading-dialog.service";
import { AlertDialogComponent } from "src/app/shared/component/alert.dialog/alert.dialog.component";
import { DialogAttribute } from "src/app/shared/component/dialogAttribute/DialogAttribute";
import { NewPassword } from "src/app/shared/model/NewPassowrd";
import { User } from "src/app/shared/model/User";
import { environment } from "src/environments";

@Component({
    selector: 'app-dashboard',
    imports: [MatIcon, MatButtonModule, ReactiveFormsModule, FormsModule],
    templateUrl: './user.component.html',
    styleUrl: './user.component.scss'
})
export class UserComponent {

    user: User = new User();
    fallbackUrl = '';
    private readonly data = inject(Data);
    private readonly dialog = inject(MatDialog);
    private readonly api = inject(Api);
    private readonly loadingDialog = inject(LoadingDialogService);
    private file: File;
    selectedColor: string = '';

    private destroyRef = inject(DestroyRef);

    ngOnInit() {
        this.user = { ...this.data.user };
        if (!this.user.profile_url) {
            this.fallbackUrl = "assets/user.png";
        }
        else {
            let url = `${environment.apiUrl}${this.user.profile_url}`;
            this.fallbackUrl = url;
        }
        const color = localStorage.getItem('themeColor');
        this.selectedColor = color ? color : '#004F4F';
    }

    change() {
        this.data.colorTool.next(this.selectedColor);
    }

    getRole(role: number): string {
        if (role == 0) return "Administrador";
        if (role == 1) return "Petición de requisiciones";
        if (role == 2) return "Compras";
        if (role == 3) return "Inventario";
        if (role == 5) return "Mantenimiento";
        if (role == 6) return "Auxiliar";
        if (role == 7) return "Asistencias";
        if (role == 8) return "Recursos Humanos";
        if (role == 9) return 'Autorizaciones';
        else return "Mayordomo";
    }

    onImageSelected(event: Event) {
        const input = event.target as HTMLInputElement;

        if (input.files && input.files[0]) {
            this.file = input.files[0];

            // Solo vista previa inmediata
            const reader = new FileReader();
            fromEvent(reader, 'load').pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
                this.fallbackUrl = reader.result as string;
            })

            fromEvent(reader, 'error').pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
                console.error('Error al leer el archivo');
                this.fallbackUrl = 'null';
            });
            reader.readAsDataURL(this.file);
        }
    }

    getAttribute(attr: string, message: string, value: string) {
        const dialogRef = this.dialog.open(DialogAttribute, { data: { message, attr, value } })
        dialogRef.afterClosed()

            .pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
                if (res) {
                    switch (attr) {
                        case 'Name': this.user.name = res; break;
                        case 'Posición': this.user.position = res; break;
                        case 'Email': this.user.email = res; break;
                        case 'Teléfono': this.user.phone = res; break;
                    }
                }
            });
    }

    onSave() {
        const formData = new FormData();
        const date = Date.now();
        const name = `${this.user.id}-${date}.png`;
        if (this.file)
            formData.append('image', this.file, name);
        formData.append('user', JSON.stringify(this.user));
        this.api.users.updateUser(formData).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
            const value = Object(res);
            if (value.message) {
                if (value.url) this.user.profile_url = value.url;
                this.data.user = this.user;
                const message = "Usuario modificado correctamente.";
                this.dialog.open(AlertDialogComponent, { data: { message, cancel: false, accept: true } })
            }
            if (value.exist) {
                const message = "Ya existe un usuario con ese correo o teléfono.";
                this.dialog.open(AlertDialogComponent, { data: { message, cancel: false, accept: true } })
            }
        })
    }

    onNewPassword() {
        const dialogRef = this.dialog.open(DialogPassword);
    }

}

@Component({
    selector: 'app-password',
    imports: [MatButtonModule, MatInputModule, MatIconModule, ReactiveFormsModule],
    template: `
    <div class="body">
        <mat-form-field appearance="outline">
            <mat-label>Nueva contraseña</mat-label>
            <input matInput placeholder="Nueva contraseña" type="password" [formControl]="formControl1">
            <!-- <mat-icon matSuffix>security</mat-icon> -->
        </mat-form-field>
        <br>
        <mat-form-field appearance="outline">
            <mat-label>Repite la contraseña</mat-label>
            <input matInput placeholder="Repetir la constraseña" type="password" [formControl]="formControl2">
            <!-- <mat-icon matSuffix>security</mat-icon> -->
        </mat-form-field>
        <br>
        <button matFab extended (click)="onSubmit()">
            <mat-icon>check_circle</mat-icon>
            Guardar
        </button>
    </div>
    `,
    styles: `
    .body{
        text-align: center;
        margin: 30px;
    }
    `
})

export class DialogPassword {

    readonly dialogRef = inject(MatDialogRef<DialogPassword>);
    readonly data = inject<any>(MAT_DIALOG_DATA);

    private readonly dialog = inject(MatDialog);
    private readonly api = inject(Api);
    private readonly loadingDialog = inject(LoadingDialogService);
    formControl1 = new FormControl('');
    formControl2 = new FormControl('');

    private destroyRef = inject(DestroyRef);

    onSubmit() {
        const pass1 = this.formControl1.value ? this.formControl1.value : '';
        const pass2 = this.formControl2.value ? this.formControl2.value : '';
        if (pass1 === '' || pass2 === '') return;
        if (pass1 === pass2) {
            const password: NewPassword = {
                password: pass1,
                repeatPassword: pass2
            }

            this.api.users.newPassword(password).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {

                const value = Object(res);
                if (value.message) {
                    this.showDialog("La contraseña fue cambiada con éxito.");
                    this.dialogRef.close();
                }
                else this.showDialog("Verifique las contraseñas, no son iguales.");
            })

        } else {
            this.showDialog("Verifique las contraseñas, no son iguales.");
        }
    }

    private showDialog(message: string) {
        this.dialog.open(AlertDialogComponent, { data: { message, cancel: false, accept: true } });
    }

}