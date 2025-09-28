import { Component } from "@angular/core";
import { MatTabsModule } from "@angular/material/tabs";
import { TableVehicleMaquinariaComponent } from "src/app/shared/component/table-vehicle-maquinaria/Table-vehicle-maquinaria.component";

@Component({
  selector: 'app-dashboard',
  imports: [MatTabsModule, TableVehicleMaquinariaComponent],
  templateUrl: './Vehicles-Maquinaria.component.html',
  styleUrl: './Vehicles-Maquinaria.component.scss'
})
export class VehicleMaquinariaComponent {
}