import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusVoucher'
})
export class StatusVoucherPipe implements PipeTransform {
  transform(value: number): string {
    switch (Number(value)) {
      case 0:
        return 'Pendiente';
      case 1:
        return 'Comprado';
      case 2:
        return 'Finalizado';
      default:
        return 'Desconocido';
    }
  }
}