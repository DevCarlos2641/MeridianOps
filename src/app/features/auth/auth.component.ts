import { Component, DestroyRef, inject } from '@angular/core';
import { Api } from '../../core/service/api.';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, firstValueFrom, Subject, takeUntil, throwError } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, NgForm } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { Credentials } from 'src/app/shared/model/TableSQL/Credentials';
import { AlertDialogComponent } from 'src/app/shared/component/alert.dialog/alert.dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Data } from 'src/app/core/service/data';
import { User } from 'src/app/shared/model/User';
import { trigger, transition, style, animate } from '@angular/animations';
import { LoadingDialogService } from 'src/app/core/service/loading-dialog.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-auth',
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
  ],
  imports: [FormsModule, MatInputModule, MatIconModule, MatButtonModule,],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {

  buttonLogin: boolean = false;
  private readonly dialog = inject(MatDialog);
  private readonly api = inject(Api);
  private readonly router = inject(Router);
  private readonly data = inject(Data);

  private destroyRef = inject(DestroyRef);

  login(form: NgForm) {
    this.buttonLogin = true;
    const credentials: Credentials = {
      email: form.value.email.trim().toLowerCase(),
      password: form.value.password
    };
    if (credentials.email === "" || credentials.password === "") {
      this.buttonLogin = false;
      return this.openDialog("Los campos son necesarios");
    }


    this.api.auth(credentials)
      .pipe(catchError((error: HttpErrorResponse) => {
        alert("Credenciales incorrectas");
        this.buttonLogin = false;

        return throwError(() => error);
      })
      )
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe(re => {
        this.buttonLogin = false;
        this.data.setUser(Object.assign(new User(), re));
        this.router.navigateByUrl('/dashboard');

      });
  }

  openDialog(message: string) {
    const dialogRef = this.dialog.open(AlertDialogComponent, {
      data: {
        message,
        cancel: true,
        accept: true
      }
    });
    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }
}
