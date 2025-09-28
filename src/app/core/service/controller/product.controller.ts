import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { RequestAmount } from "src/app/shared/model/dto/RequestAmount";
import { RequestOutputPds } from "src/app/shared/model/dto/RequestOutputPds";
import { ResponseGetPdsByReq } from "src/app/shared/model/dto/ResponseGetPdsByReq";
import { Product } from "src/app/shared/model/Product";
import { environment } from "src/environments";

@Injectable({
    providedIn: 'root'
})
export class ProductController{
    private url = environment.apiUrl;
    private http = inject(HttpClient);

    get(){
        return this.http.get<Product[]>(`${this.url}/product`);
    }

    getById(id:number){
        return this.http.get<Product>(`${this.url}/product/${id}`);
    }

    getProductsByIdRequisition(id: number){
        return this.http.get<ResponseGetPdsByReq>(`${this.url}/product/by_id_requisition/${id}`);
    }

    getProductsByUser(){
        return this.http.get<Product[]>(`${this.url}/product/byUser`);
    }
    
    getProductsByRanch(id: number){
        return this.http.get<Product[]>(`${this.url}/product/byRanch/${id}`);
    }

    postProduct(product: Product){
        return this.http.post(`${this.url}/product/new`, product);
    }

    updateProduct(product: Product){
        return this.http.put(`${this.url}/product/update`, product);
    }

    addAmount(amount: RequestAmount){
        return this.http.post(`${this.url}/product/add-amount`, amount)
    }

    updateUnitForProduct(data:any){
        return this.http.post(`${this.url}/product/unit_for_product`, data);
    }

    postOutput(data: RequestOutputPds){
        return this.http.post(`${this.url}/product/output`, data);
    }

    addInRanch(id:number[]){
        return this.http.post<Product[]>(`${this.url}/product/add_in_ranch`, id);
    }

    getForReport(id: number, pos: number){
        return this.http.get<any[]>(`${this.url}/product/report1/${id}/${pos}`)
    }

    getForreport2(id: number, pos: number, data: any){
        return this.http.post<any[]>(`${this.url}/product/report2/${id}/${pos}`, data)
    }

    getForreport3(id: number, pos: number, data: any){
        return this.http.post<any[]>(`${this.url}/product/report3/${id}/${pos}`, data)
    }

    postOutputGeneral(data: any){
        return this.http.post(`${this.url}/product/output-general`, data);
    }

    downloadFormat(){
        return this.http.get<any[]>(`${this.url}/product/format`);
    }

    uploadProducts(data: any){
        return this.http.post(`${this.url}/product/upload`, data);
    }
    
    postImage(data: FormData){
        return this.http.post<any>(`${this.url}/product/image`, data);
    }

}