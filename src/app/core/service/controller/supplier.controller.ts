import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { environment } from "src/environments";

@Injectable({
    providedIn: 'root'
})
export class SupplierController{
    private url = environment.apiUrl;
    private http = inject(HttpClient);

    getSupplierByProduct(data:any){
        return this.http.post(`${this.url}/supplier/byProducts`, data);
    }

    get(){
        return this.http.get(`${this.url}/supplier`);
    }

    getVehicles(){
        return this.http.get(`${this.url}/supplier/vehicle`)
    }

    getHouse(){
        return this.http.get(`${this.url}/supplier/house`)
    }

}