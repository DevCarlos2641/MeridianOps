import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Requisition } from "src/app/shared/model/Requisition";
import { environment } from "src/environments";
import { ProductRequisition } from "src/app/shared/model/ProductRequisition";
import { ResponsePostRequisition } from "src/app/shared/model/dto/ResponsePostRequisition";
import { ResponseGetRequisitionFull } from "src/app/shared/model/dto/ResponseGetRequisitionFull";
import { RequestRequsitionVehicle } from "src/app/shared/model/dto/RequestRequisitionVehicle";
import { RequestRequisition } from "src/app/shared/model/dto/RequestRequisition";

@Injectable({
    providedIn: 'root'
})
export class RequisitionController{
    private url = environment.apiUrl;
    private http = inject(HttpClient);

    postRequisition(requisition: Requisition, products: ProductRequisition[]){
        const data = new RequisitionDTO();
        data.requisition = requisition;
        data.products = products;
        return this.http.post<ResponsePostRequisition>(`${this.url}/requisition`, data);
    }

    postRequisitionVehicle(requisicion: Requisition, vehicles:any[]){
        const data = new RequestRequsitionVehicle();
        data.requisition = requisicion;
        data.vehicles = vehicles;
        return this.http.post<ResponsePostRequisition>(`${this.url}/requisition/vehicle`, data)
    }
    
    getRequisition(date:any){
        return this.http.post<Requisition[]>(`${this.url}/requisition/date`, date);
    }

    getRequisitionFull(){
        return this.http.get<ResponseGetRequisitionFull[]>(`${this.url}/requisition/full`);
    }

    getRequisitionFullGuard(date: any){
        return this.http.post<ResponseGetRequisitionFull[]>(`${this.url}/requisition/guards`, date);
    }

    getRequisitionFullHistory(date: any){
        return this.http.post<ResponseGetRequisitionFull[]>(`${this.url}/requisition/history`, date);
    }

    find(id_requisition: number){
        return this.http.get<RequestRequisition>(`${this.url}/requisition/getById/${id_requisition}`);
    }

    authorize(id:number){
        return this.http.get(`${this.url}/requisition/auth/${id}`);
    }

    getToExcel(type: number){
        return this.http.get<any[]>(`${this.url}/requisition/toExcel/${type}`);
    }

    delete(id: number){
        return this.http.get(`${this.url}/requisition/delete/${id}`);
    }
}

class RequisitionDTO{
    requisition: Requisition;
    products: ProductRequisition[]
}