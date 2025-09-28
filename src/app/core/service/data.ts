import { inject, Injectable } from "@angular/core";
import { ProductService } from "./data/product.service";
import { NewProductsService } from "./data/newProducts.service";
import { User } from "src/app/shared/model/User";
import { RequisitionPd } from "./data/RequisitionPd";
import { HistoryRequisition } from "./data/HistoryRequisition";
import { RequisitionService } from "./data/requisitions";
import { RequisitionFull } from "./data/RequisitionFull";
import { ResponseGetRequisitionFull } from "src/app/shared/model/dto/ResponseGetRequisitionFull";
import { VoucherProductsService } from "./data/VoucherProducts";
import { Ranch } from "src/app/shared/model/Ranch";
import { Requisitionvehicle } from "./data/RequisitionVehicle";
import { ProductOutputService } from "./data/ProductOutput";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class Data {

    readonly products = inject(ProductService);                 //  Productos
    readonly newProducts = inject(NewProductsService);          //  Nuevos productos para dar de alta
    readonly requisition = inject(RequisitionService);          //  Productos para mostrar de la requisición
    readonly requisitionPd = inject(RequisitionPd);             //  Informacion adicional de los productos de la requisicion
    readonly historyRequisition = inject(HistoryRequisition);   //  Historial de las requisiciones
    readonly voucherProducts = inject(VoucherProductsService);
    readonly requisitionsFull = inject(RequisitionFull);
    readonly requisitionsFullHistory = inject(RequisitionFull);
    readonly requisitionVeh = inject(Requisitionvehicle)
    readonly productOutput = inject(ProductOutputService);
    user: User;
    requisitionAssign: ResponseGetRequisitionFull = new ResponseGetRequisitionFull();
    currentRanch: Ranch;
    routerHistory = false;
    searchFiltre = '';
    dateHistory = '';
    searchFilterHistory = '';
    termfHistory = '';
    commentVoucher = '';
    colorTool = new BehaviorSubject<string>('');

    constructor() {
        const color = localStorage.getItem('themeColor');
        this.colorTool.next(color ? color : '#004F4F');
    }

    setUser(user: User) {
        this.user = Object.assign(new User(), user);
    }

    cleanAll() {
        this.products.setProducts([]);
        this.newProducts.set([]);
        this.requisition.set([]);
        this.requisitionPd.set([]);
        this.historyRequisition.set([]);
        this.voucherProducts.set([]);
        this.requisitionsFull.set([]);
    }

}