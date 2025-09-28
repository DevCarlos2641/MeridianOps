import { Component, DestroyRef, inject, InjectionToken } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MatDividerModule } from "@angular/material/divider";
import { MatInputModule } from "@angular/material/input";
import { BehaviorSubject, combineLatest, startWith, debounceTime, distinctUntilChanged, map } from "rxjs";
import { Employed } from "../../model/Employed";
import { AsyncPipe } from "@angular/common";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { Api } from "src/app/core/service/api.";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
    selector: 'app-table-vehicle-maquinaria',
    imports: [MatInputModule, ReactiveFormsModule, MatDividerModule, AsyncPipe, MatIconModule],
    templateUrl: './dialog-employed.component.html',
    styleUrl: './dialog-employed.component.scss'
})
export class DialogEmployedComponent {

    readonly dialogRef = inject(MatDialogRef<DialogEmployedComponent>);
    readonly data = inject<any>(MAT_DIALOG_DATA);
    private readonly api = inject(Api);
    filtre = new FormControl('');
    private allEmployed$ = new BehaviorSubject<Employed[]>([]);
    private destroyRef = inject(DestroyRef);
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
    onSelectEmployed(item: any) {
        this.dialogRef.close(item)
    }

    ngOnInit() {
        if (this.data) {
            if (this.data.complete) {
                this.api.users.getEmployeds().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
                    this.allEmployed$.next(res);
                })
            } else {
                this.api.users.getEmployedByEnterprise().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
                    this.allEmployed$.next(res);
                })
            }
        }
    }
}