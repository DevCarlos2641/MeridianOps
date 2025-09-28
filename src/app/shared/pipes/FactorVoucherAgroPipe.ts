import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'factorVoucher'
})
export class FactorVoucherAgroPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    return value.split(',')[0];
  }
}