import { AsyncPipe } from "@angular/common";
import { Component, DestroyRef, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatDialog } from "@angular/material/dialog";
import { MatDividerModule } from "@angular/material/divider";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, map, startWith } from "rxjs";
import { Api } from "src/app/core/service/api.";
import { LoadingDialogService } from "src/app/core/service/loading-dialog.service";
import { DialogEmployedNewOrUpdate } from "src/app/shared/component/dialogNewOrUpdateEmployed/employedNewOrUpdate.component";
import { Employed } from "src/app/shared/model/Employed";

@Component({
    selector: 'products-component',
    imports: [MatIconModule, MatInputModule, MatDividerModule, ReactiveFormsModule, AsyncPipe, MatButtonModule],
    templateUrl: './employed.component.html',
    styleUrl: './employed.component.scss'
})
export class EmployedComponent {

    private readonly dialog = inject(MatDialog);
    private readonly api = inject(Api);
    private destroyRef = inject(DestroyRef);

    currentEmployed: Employed;
    filtre = new FormControl('');
    private allEmployed$ = new BehaviorSubject<Employed[]>([]);
    filteredEmployed$ = combineLatest([
        this.allEmployed$,
        this.filtre.valueChanges.pipe(
            startWith(''),
            debounceTime(300),
            distinctUntilChanged(),
            map(value => value?.toLowerCase().trim() || ''),
        )
    ]).pipe(
        map(([employ, searchTerm]) =>
            employ.filter(emp =>
                emp.name.toLowerCase().includes(searchTerm)
            )
        )
    );

    ngOnInit() {
        this.api.users.getEmployeds().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
            this.allEmployed$.next(res);
        })
    }

    updateEmployed(employed: Employed) {
        const dialogRef = this.dialog.open(DialogEmployedNewOrUpdate,
            {
                data: {
                    mode: 1,
                    employed
                }
            }
        );
        dialogRef.afterClosed()
            .pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
                if (res) {
                    employed.name = res.name;
                    employed.email = res.email;
                    employed.phone = res.phone;
                    employed.active = res.active;
                    employed.position = res.position;
                    employed.username = res.username;
                }
            })
    }

    newEmployed() {
        const dialogRef = this.dialog.open(DialogEmployedNewOrUpdate,
            {
                data: {
                    mode: 0,
                }
            }
        );
        dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {

        })
    }

    onSelectEmployed(employed: Employed) {
        this.currentEmployed = employed;
    }
}