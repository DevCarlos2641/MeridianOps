import { Component, DestroyRef, inject, Pipe, PipeTransform } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { Data } from 'src/app/core/service/data';
import { EnumRole } from 'src/app/shared/model/TableSQL/EnumRole';
import { Api } from 'src/app/core/service/api.';
import { LoadingDialogService } from 'src/app/core/service/loading-dialog.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDivider } from "@angular/material/divider";
import { NgStyle } from '@angular/common';
import { MatBadge } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { AlertDialogComponent } from 'src/app/shared/component/alert.dialog/alert.dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Pipe({
  name: 'roleName'
})
export class RoleNamePipe implements PipeTransform {
  transform(value: EnumRole): string {
    switch (Number(value)) {
      case EnumRole.ADMIN:
        return 'Administrador';
      case EnumRole.REQUISITION:
        return 'Requisiciones';
      case EnumRole.SHOPPING:
        return 'Compras';
      case EnumRole.INVENTORY:
        return 'Inventario';
      case EnumRole.BLUTER:
        return 'Bluter';
      case EnumRole.MANTENIMIENTO:
        return 'Mantenimiento';
      case EnumRole.AUXILIAR:
        return 'Auxiliar';
      case EnumRole.ASISTANCE:
        return 'Asistencias';
      case EnumRole.RH:
        return 'Recursos Humanos';
      case EnumRole.AUTH:
        return 'Autorizaciones';
      default:
        return 'Desconocido';
    }
  }
}

@Component({
  selector: 'app-dashboard',
  imports: [MatSidenavModule, MatButtonModule, MatToolbarModule, MatIconModule, RouterOutlet, RouterLink, RoleNamePipe, MatDivider,
    NgStyle, MatBadge, MatMenuModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  private readonly api = inject(Api);
  private readonly dialog = inject(MatDialog)
  private readonly router = inject(Router);
  readonly data = inject(Data);
  private readonly role = this.data.user.role;
  selectedColor: string;
  nBadge = 0;
  itemExpiration: any[] = [];
  btnColor = '';
  option1 = false;
  option1_1 = false;
  option2 = false;
  option3 = false;
  option4 = false;
  option5 = false;
  option6 = false;
  option7 = false;
  option8 = false;
  option9 = false;
  option10 = false;
  option11 = false;
  option12 = false;

  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    const color = localStorage.getItem('themeColor');
    this.selectedColor = color ? color : '#004F4F';
    this.verifiedRole();
    this.data.colorTool.asObservable().subscribe(res => {
      localStorage.setItem('themeColor', res);
      this.selectedColor = res;
    })
  }

  verifiedRole() {

    if (this.role == EnumRole.SHOPPING) {
      this.option1 = true;
      this.option2 = true;
      this.selectedColor = this.btnColor
    }

    if (this.role == EnumRole.REQUISITION) {
      this.option1 = true;
      this.option2 = true;
    }

    if (this.role == EnumRole.ADMIN) {
      this.option1 = true;
      this.option1_1 = true;
      this.option2 = true;
      this.option3 = true;
      this.option4 = true;
      this.option5 = true;
      this.option6 = true;
      this.option10 = true;
      this.option11 = true;
      this.option12 = true;
    }

    if (this.role == EnumRole.INVENTORY) {
      this.option2 = true;
      this.option10 = true;
    }

    if (this.role == EnumRole.MANTENIMIENTO) {
      this.option1 = true;
      this.option2 = true;
      this.option7 = true;
      this.verifiedDates();
    }

    if (this.role == EnumRole.AUXILIAR) {
      this.option8 = true;
      this.option2 = true;
      this.option10 = true;
    }
    if (this.role == EnumRole.ASISTANCE) {
      this.option9 = true;
    }
    if (this.role == EnumRole.RH) {
      this.option4 = true;
      this.option6 = true;
    }

    if (this.role == EnumRole.AUTH) this.option11 = true;
  }

  logout() {
    this.api.logout().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
      this.router.navigateByUrl('/');
      this.data.cleanAll();

    })
  }

  downloadDB(){
    
  }

  verifiedDates() {
    this.api.vehicle.getExpirations().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
      this.nBadge = res.length;
      res.forEach(v => {
        const text: string = `${v.economic_number} - ${v.type} - ${v.model} `;
        const data = {
          title: text,
          message: `
            Ultimas fechas\n
            Póliza: ${v.last_insure}\n
            Licencia del conductor: ${v.last_lisense}
          `
        }
        this.itemExpiration.push(data);
      })
    })
  }

  showInfo(item: any) {
    const message = `
      ${item.title}\n\n
      ${item.message}
    `;
    const dialogRed = this.dialog.open(AlertDialogComponent, { data: { message, cancel: false, accept: true } });
    dialogRed.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  routerByRole() {
    if (this.role == EnumRole.REQUISITION) {
      this.router.navigateByUrl('dashboard/requisicion');
    }
    if (this.role == EnumRole.SHOPPING || this.role == EnumRole.MANTENIMIENTO || this.role == EnumRole.ADMIN) {
      this.router.navigateByUrl('dashboard/compras/requisiciones');
    }
  }

}
