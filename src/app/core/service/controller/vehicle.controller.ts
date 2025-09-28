import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { RequestVehicle } from "src/app/shared/model/dto/RequestVehicles";
import { RequestVouchersV } from "src/app/shared/model/dto/RequestVouchersV";
import { ResponseNewVehicle } from "src/app/shared/model/dto/ResponseNewVehicle";
import { Vehicle } from "src/app/shared/model/Vehicle";
import { environment, localL } from "src/environments";

@Injectable({
    providedIn: 'root'
})
export class VehicleController {
    private url = environment.apiUrl;
    private url2 = localL;
    private http = inject(HttpClient);

    getByUser() {
        return this.http.get<Vehicle[]>(`${this.url}/vehicle`);
    }

    getVehiclesByIdRequisition(id: number) {
        return this.http.get<RequestVehicle>(`${this.url}/vehicle/by_id_requisition/${id}`);
    }

    getCategory(category: string) {
        return this.http.get(`${this.url}/vehicle/get_by_category/${category}`);
    }

    getByRanch() {
        return this.http.get(`${this.url}/vehicle/by_ranch`);
    }

    postVehicle(data: any) {
        return this.http.post<ResponseNewVehicle>(`${this.url}/vehicle`, data);
    }

    assign(data: any) {
        return this.http.post<any>(`${this.url}/vehicle/assign`, data);
    }

    getServices() {
        return this.http.get<any[]>(`${this.url}/vehicle/services`);
    }

    getVehicle(id: number) {
        return this.http.get<Vehicle>(`${this.url2}/vehicle/${id}`);
    }

    getVouchers(id: number){
        return this.http.get<RequestVouchersV[]>(`${this.url2}/vehicle/${id}/vouchers`);
    }

    postImage(formdata: FormData){
        return this.http.post<any>(`${this.url}/vehicle/image`, formdata);
    }

    putVehicle(vehicle: Vehicle){
        return this.http.put(`${this.url2}/vehicle/${vehicle.id}`, vehicle);
    }

    patchVehicle(value: any, id:number){
        return this.http.patch(`${this.url2}/vehicle/${id}/enterprise`, value);
    }

    getExpirations(){
        return this.http.get<any[]>(`${this.url2}/vehicle/expirations`);
    }
}