import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: 'traducirColumna',
  standalone: true // Si usas Angular 15+ con standalone components
})
export class TraducirColumnaPipe implements PipeTransform {
  transform(campo: string): string {
    const traducciones: Record<string, string> = {
      economic_number: 'Numero economico',
      ranch_name: 'Rancho',
      type: 'Tipo',
      brand: 'Marca',
      model: 'Modelo',
      active: 'Activo',
      status: 'Estado',
      responsible: 'Responsable'
    };

    return traducciones[campo] ?? campo;
  }
}