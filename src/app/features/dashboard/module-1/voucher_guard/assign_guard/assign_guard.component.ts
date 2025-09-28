import { trigger, transition, style, animate, keyframes } from "@angular/animations";
import { AsyncPipe, CurrencyPipe } from "@angular/common";
import { Component, DestroyRef, ElementRef, inject, ViewChild } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from "@angular/material/dialog";
import { MatDivider } from "@angular/material/divider";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIcon } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { ActivatedRoute, Router } from "@angular/router";
import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, map, Observable, startWith } from "rxjs";
import { Api } from "src/app/core/service/api.";
import { animationAparecerDes } from "src/app/shared/animations/animation";
import { Employed } from "src/app/shared/model/Employed";
import { Product } from "src/app/shared/model/Product";
import { DatePipe } from "src/app/shared/pipes/DatePipe";
import { StatusVoucherPipe } from "src/app/shared/pipes/StatusVoucherPipe";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { AlertDialogComponent } from "src/app/shared/component/alert.dialog/alert.dialog.component";
import { Data } from "src/app/core/service/data";

@Component({
  selector: 'app-voucher-guard-assign',
  imports: [MatButtonModule, MatIcon, AsyncPipe, CurrencyPipe, DatePipe, StatusVoucherPipe, FormsModule],
  templateUrl: './assign_guard.component.html',
  styleUrl: './assign_guard.component.scss',
  animations: [animationAparecerDes]
})
export class VoucherGuardAssignComponent {

  @ViewChild('content', { static: false }) content!: ElementRef;
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(Api);
  private readonly dialog = inject(MatDialog);
  private readonly data = inject(Data);
  private destroyRef = inject(DestroyRef);

  private id_voucher: number;
  pds$!: Observable<any[]>;
  vocuher$!: Observable<any>;
  date = new Date();
  employed: Employed = new Employed();
  folio = 0;
  urlImage = "";
  pds: any[] = [];
  total = 0;
  comment = '';

  ngOnInit() {
    this.comment = this.data.commentVoucher;
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
        if (!params.get('id')) this.back();
        this.id_voucher = Number(params.get('id'));
        this.pds$ = this.api.voucher.getPdsById(this.id_voucher);
        this.vocuher$ = this.api.voucher.getById(this.id_voucher);
        this.pds$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
          this.folio = res[0].id_voucher_guard;
        })
        this.vocuher$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
          if (res.enterprise_name === 'MeridianOps') this.urlImage = "assets/logo.jpg";
          if (res.enterprise_name === 'AVOAGO') this.urlImage = "assets/avoago.jpg";
          if (res.enterprise_name === 'AVOCATS') this.urlImage = "assets/avocats.jpg";
          if (res.enterprise_name === 'AGRONEV') this.urlImage = "assets/agronev.jpg";
          if (res.enterprise_name === 'AGUABERRIES') this.urlImage = "assets/aguaberries.jpg";
        })
      });
  }

  ngOnDestroy() {
    this.data.commentVoucher = '';
  }

  back() {
    this.router.navigate(['/dashboard/resguardo']);
  }

  searchEmployed() {
    const dialog = this.dialog.open(DialogSearchEmployed)
    dialog.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
      if (res) this.employed = res;
    })
  }

  selectProduct(item: any) {
    const pd = this.pds.find(v => v.id === item.id)
    if (pd) return;
    item.pz = 1;
    this.pds.push(item);
    this.total = this.getTotal();
  }

  generatePDF() {
    if (this.pds.length === 0) return;
    if (!this.employed.id) return;

    const data = this.content.nativeElement;
    html2canvas(data, {
      scale: 2,
      useCORS: true,
      logging: true,
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/jpeg', 0.7);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'letter', // 216 x 279 mm
      });

      const pageWidth = 210;   // contenido útil dentro de carta
      const pageHeight = 279;

      const imgProps = pdf.getImageProperties(imgData);
      const originalImgWidth = imgProps.width;
      const originalImgHeight = imgProps.height;

      const aspectRatio = originalImgHeight / originalImgWidth;

      // Ajustamos para que DOS imágenes quepan verticalmente en la misma hoja
      const maxImgHeight = pageHeight / 2; // dividimos en 2 partes iguales
      const scaledWidth = pageWidth;
      const scaledHeight = scaledWidth * aspectRatio;

      // Si la altura es muy grande, reducimos hasta que quepa 2 veces
      const finalHeight = scaledHeight > maxImgHeight ? maxImgHeight : scaledHeight;

      pdf.addImage(imgData, 'JPEG', 0, 0, scaledWidth, finalHeight);
      pdf.addImage(imgData, 'JPEG', 0, finalHeight, scaledWidth, finalHeight);

      pdf.save('documento.pdf');
    });
  }



  getTotal() {
    return this.pds
      .map(v => Number((v.unitary_price) * 1.16) * v.pz)
      .reduce((sum, current) => sum + current, 0);
  }

  updatePrices() {
    this.total = this.getTotal();
  }

  saveVoucher() {
    if (this.pds.length === 0) return;
    if (!this.employed.id) return;
    const desc = this.pds.map(v => `${v.modelo}|${v.serie}`).join(',');
    const voucher = {
      id: this.folio,
      id_employed: this.employed.id,
      description: desc
    }
    const message = "¿Desea continuar?"
    const dialogRef = this.dialog.open(AlertDialogComponent, { data: { message, cancel: false, accept: true } });
    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
      if (res) {
        this.api.voucher.putVoucherGuard(voucher).subscribe(res => {
          if (res) {
            const message = "Vale de resguardo guardado correctamente";
            const dialogRef = this.dialog.open(AlertDialogComponent, { data: { message, cancel: false, accept: true } });
            dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
            this.back();
          }
        })
      }
    })
  }
}

@Component({
  selector: 'app-alert.dialog',
  imports: [MatButtonModule, MatFormFieldModule, MatDivider, ReactiveFormsModule, AsyncPipe, MatInputModule, MatIcon],
  template: `
    <div class="user-list">
      <mat-form-field appearance="outline">
          <mat-label>Buscar por nombre</mat-label>
          <input matInput placeholder="Nombre" [formControl]="filtre">
          <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>
      <div class="list">
          @if(filteredEmployed$ | async; as employes){
          @for (item of employes; track $index) {
          <div class="item" (click)="onSelectEmployed(item)" @fadeInOut>
              <div style="text-align: start;">
                  <p>{{item.name}}</p>
                  <p>{{item.position}}</p>
              </div>
              <div style="text-align: end;">
                  <p>{{item.enterprise}}</p>
                  <p>{{item.seniority}}</p>
              </div>
          </div>
          <mat-divider @fadeInOut></mat-divider>
          }
          }
      </div>
  </div>
  `,
  styles: `
  .user-list {
      text-align:center;
      cursor: pointer;
      user-select: none;
      margin: 1rem;
      padding: 1rem;
      border-radius: 20px;
      .list{
          max-height: 60vh;
          overflow-y: auto;
      }
      .item{
          border-radius: 10px;
          padding: 0.5rem;
          display: flex;
          justify-content: space-between;
          transition: background 0.3s ease;
      }

      .item:hover{
          background-color: rgba(0, 0, 0, 0.1);
      }
  }
  `,
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-500px)' }),
        animate('500ms ease-out', keyframes([
          style({ opacity: 1, transform: 'translateY(220px)' }),
          style({ transform: 'translateY(-10px)' }),
          style({ transform: 'translateY(0px)' }),
        ])),
      ]),
    ])]
})
export class DialogSearchEmployed {
  readonly dialogRef = inject(MatDialogRef<DialogSearchEmployed>);
  private readonly api = inject(Api);
  readonly data = inject<any>(MAT_DIALOG_DATA);
  private destroyRef = inject(DestroyRef);

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

  onSelectEmployed(employ: Employed) {
    this.dialogRef.close(employ);
  }

}
