import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fechaEs'
})
export class DatePipe implements PipeTransform {
  private diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  private meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                   'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

  transform(value: Date | string | number): string {
    const fecha = new Date(value);
    const diaSemana = this.diasSemana[fecha.getDay()];
    const dia = fecha.getDate();
    const mes = this.meses[fecha.getMonth()];
    const año = fecha.getFullYear();

    return `${diaSemana} ${dia} de ${mes} de ${año}`;
  }
}