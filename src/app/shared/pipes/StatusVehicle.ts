import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'activeStatus'
})
export class StatusVehiclePipe implements PipeTransform {
  transform(value: boolean | string | number): string {
    if (typeof value === 'string') {
      value = value.toLowerCase() === 'true' || value === '1';
    } else if (typeof value === 'number') {
      value = value === 1;
    }
    return value ? 'Activo' : 'Inactivo';
  }
}