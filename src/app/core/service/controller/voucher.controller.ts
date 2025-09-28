import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { RequestComment } from "src/app/shared/model/dto/RequestComment";
import { RequestStatus } from "src/app/shared/model/dto/RequestStatus";
import { RequestVoucher } from "src/app/shared/model/dto/RequestVoucher";
import { ResponseIdsInput } from "src/app/shared/model/dto/ResponseIdsInput";
import { ResponsePdsVoucher } from "src/app/shared/model/dto/ResponsePdsVoucher";
import { environment } from "src/environments";

@Injectable({
    providedIn: 'root'
})
export class VoucherController {
    private url = environment.apiUrl;
    private http = inject(HttpClient);

    postVoucher(data: RequestVoucher) {
        return this.http.post(`${this.url}/voucher`, data);
    }

    getById(id_voucher: number) {
        return this.http.get(`${this.url}/voucher/${id_voucher}`);
    }

    getIds($id_requisition: number) {
        return this.http.get<any[]>(`${this.url}/voucher/ids/${$id_requisition}`);
    }

    getProducts(id_voucher: string, id_requisition: number) {
        const ids = `${id_voucher},${id_requisition}`;
        return this.http.get<ResponsePdsVoucher>(`${this.url}/voucher/pds/${ids}`);
    }

    postStatusVoucherAndRq(data: RequestStatus) {
        return this.http.post(`${this.url}/voucher/status`, data);
    }

    postStatusVoucherStock(data: RequestStatus) {
        return this.http.post(`${this.url}/voucher/status/stock`, data);
    }

    postStatusVoucherAndRqAgro(data: RequestStatus) {
        return this.http.post(`${this.url}/voucher/status/agro`, data);
    }

    finishedVoucher(data: RequestStatus) {
        return this.http.post(`${this.url}/voucher/finished`, data);
    }

    postImage(formData: FormData) {
        return this.http.post(`${this.url}/voucher/image`, formData);
    }

    addComment(comment: RequestComment) {
        return this.http.post(`${this.url}/voucher/comment`, comment);
    }

    getIdsInput(id_requisition: number) {
        return this.http.get<ResponseIdsInput>(`${this.url}/voucher/ids_input/${id_requisition}`);
    }

    getProductsIds(id_voucher: number) {
        return this.http.get<any[]>(`${this.url}/voucher/pdsIds/${id_voucher}`);
    }

    changeSupplier(data: any) {
        return this.http.post(`${this.url}/voucher/change-supplier`, data);
    }

    setStatusVehicle(data: any) {
        return this.http.post(`${this.url}/voucher/status/vehicle`, data);
    }

    getPdsById(id_voucher: number) {
        return this.http.get<any[]>(`${this.url}/voucher/pds_by_id/${id_voucher}`);
    }

    putVoucherGuard(data: any) {
        return this.http.put(`${this.url}/voucher/put`, data);
    }

    putDateVoucherfiscal(data: any){
        return this.http.put(`${this.url}/voucher/fiscal/date`, data);
    }

    getCredit(){
        return this.http.get(`${this.url}/voucher/fiscal/credit`);
    }

    changeVoucher(id: number, data:any){
        return this.http.put(`${this.url}/voucher/change_voucher/${id}`, data);
    }

    getVoucherInputs(){
        return this.http.get<any[]>(`${this.url}/voucher/inputs`);
    }

}