import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: 'vouchersIds'
})
export class VocuhersIds implements PipeTransform {
  transform(value: string): string {
    if (value?.includes('-1')) {
      return 'Folios';
    } else if (value?.includes('-2')) {
      return 'Mantt';
    }
    return value;
  }
}