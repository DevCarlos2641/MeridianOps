import { trigger, transition, style, animate } from "@angular/animations";
import { Component, DestroyRef, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatDialog } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import * as FingerprintJS from '@fingerprintjs/fingerprintjs';
import { Api } from "src/app/core/service/api.";
import { LoadingDialogService } from "src/app/core/service/loading-dialog.service";
import { AlertDialogComponent } from "src/app/shared/component/alert.dialog/alert.dialog.component";

@Component({
  selector: 'app-assistance',
  imports: [ReactiveFormsModule, MatInputModule, MatIconModule, MatButtonModule],
  templateUrl: './assistance.component.html',
  styleUrl: './assistance.component.scss',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(15px)' }),
        animate('500ms', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('500ms', style({ opacity: 0, transform: 'translateY(15px)' })),
      ]),
    ])
  ]
})
export class AssistanceComponent {

  private readonly dialog = inject(MatDialog);
  private readonly api = inject(Api);


  showPassword: boolean = false;

  togglePassword() { this.showPassword = !this.showPassword; }

  username = new FormControl('');
  password = new FormControl('');
  loading = false;
  error = '';
  fingerprintId = '';
  latitude: number | null = null;
  longitude: number | null = null;
  private destroyRef = inject(DestroyRef);
  
  async ngOnInit() {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    this.fingerprintId = result.visitorId;
    this.getGeolocation();
  }

  getGeolocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        this.latitude = pos.coords.latitude;
        this.longitude = pos.coords.longitude;
      },
        (error) => {
          const message = "Favor de activar su localización para su asistencia"
          this.dialog.open(AlertDialogComponent, { data: { message, cancel: false, accept: true } })
        }
        , {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
    }
  }

  registrarAsistencia() {
    const username = this.username.value ? this.username.value : '';
    const password = this.password.value ? this.password.value : '';
    const latitude = this.latitude ? this.latitude : 0;
    const longitude = this.longitude ? this.longitude : 0;

    if (username === '' || password === '') {
      const message = "Ingrese correo o contraseña.";
      this.dialog.open(AlertDialogComponent, { data: { message, cancel: false, accept: true } });
      return;
    }

    if (latitude === 0 || longitude === 0) {
      const message = "Habilite la ubicación para su asistencia.";
      this.dialog.open(AlertDialogComponent, { data: { message, cancel: false, accept: true } });
      return;
    }

    const credentials: CredentialsAssistance = {
      username: String(username).trim().toLowerCase(),
      password: String(password).trim(),
      fingerprintId: this.fingerprintId,
      latitude: latitude,
      longitude: longitude
    }

    this.loading = true;
    this.api.users.assistance(credentials).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res: any) => {
        this.loading = false;
        const value = Object(res);
        if (value.exist) {
          const message = "Su asistencia ya fue registrada.";
          this.showDialog(message, false, true);
          this.error = ''
        }
        if (value.success) {
          const message = "Asistencia registrada.";
          this.showDialog(message, false, true);
          this.error = '';
        }
      },
      error: err => {
        this.loading = false;
        this.error = 'Error al registrar asistencia.' + err.toString();
        console.error(err);
      }
    });
  }

  private showDialog(message: string, cancel: boolean, accept: boolean) {
    this.dialog.open(AlertDialogComponent, { data: { message, cancel, accept } });
  }
}

export interface CredentialsAssistance {
  username: string;
  password: string;
  fingerprintId: string;
  latitude: number,
  longitude: number
}