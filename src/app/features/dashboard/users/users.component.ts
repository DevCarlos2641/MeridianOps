import { AsyncPipe } from "@angular/common";
import { Component, DestroyRef, inject } from "@angular/core";
import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, filter, map, Observable, startWith, Subject, takeUntil } from "rxjs";
import { Api } from "src/app/core/service/api.";
import { User } from "src/app/shared/model/User";
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from "@angular/material/input";
import { MatIcon } from "@angular/material/icon";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { DialogUserNewOrUpdate } from "src/app/shared/component/dialogNewOrUpdateUser/userNewOrUpdate.component";
import { MatDialog } from "@angular/material/dialog";
import { AlertDialogComponent } from "src/app/shared/component/alert.dialog/alert.dialog.component";
import { LoadingDialogService } from "src/app/core/service/loading-dialog.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Enterprise } from "src/app/shared/model/Enterprise";

@Component({
  selector: 'app-user',
  imports: [AsyncPipe, MatDividerModule, MatInputModule, MatIcon, ReactiveFormsModule, FormsModule, MatButtonModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent {

  private readonly api = inject(Api);
  private readonly loadingDialog = inject(LoadingDialogService);
  private readonly dialog = inject(MatDialog);
  currentUser: User;

  filtre = new FormControl('');
  private allUsers$ = new BehaviorSubject<User[]>([]);

  filteredUsers$ = combineLatest([
    this.allUsers$,
    this.filtre.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      map(value => value?.toLowerCase().trim() || '')
    )
  ]).pipe(
    map(([users, searchTerm]) =>
      users.filter(user =>
        user.name.toLowerCase().includes(searchTerm)
      )
    )
  );

  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    this.api.users.getUsers().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(users => this.allUsers$.next(users));
  }

  onSelectUser(user: User) {
    this.currentUser = user;
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

  newUser() {
    const dialogRef = this.dialog.open(DialogUserNewOrUpdate);
    dialogRef.afterClosed()

      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => {
        if (value) {
          this.dialog.open(AlertDialogComponent, { data: { message: value, cancel: false, accept: true } });
        }
      });
  }

}