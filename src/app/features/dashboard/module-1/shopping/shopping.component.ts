import { Component, inject } from "@angular/core";
import { Router, RouterOutlet } from "@angular/router";
import { Data } from "src/app/core/service/data";

@Component({
  selector: 'app-requisition',
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`
})
export class ShoppingComponent {

  private readonly router = inject(Router);
  private readonly data = inject(Data);

  ngOnInit() {
    this.router.navigateByUrl('dashboard/compras/requisiciones')
  }

  ngOnDestroy() {
    this.data.routerHistory = false;
  }

}