import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments";
import { HttpClient } from "@angular/common/http";
import { ProductController } from "./controller/product.controller";
import { User } from "src/app/shared/model/User";
import { RequisitionController } from "./controller/requisition.controller";
import { SupplierController } from "./controller/supplier.controller";
import { VoucherController } from "./controller/voucher.controller";
import { UserController } from "./controller/user.controller";
import { VehicleController } from "./controller/vehicle.controller";

@Injectable({
    providedIn: 'root'
})
export class Api{
    
    private url = environment.apiUrl;
    private http = inject(HttpClient);
    readonly products = inject(ProductController);
    readonly requisition = inject(RequisitionController);
    readonly suppliers = inject(SupplierController);
    readonly voucher = inject(VoucherController);
    readonly users = inject(UserController);
    readonly vehicle = inject(VehicleController);

    auth(credential: any){
        return this.http.post<User>(`${this.url}/auth`, credential);
    }

    remember(){
        return this.http.get<User>(`${this.url}/auth/remember`)
    }

    logout(){
        return this.http.get(`${this.url}/auth/logout`);
    }
}