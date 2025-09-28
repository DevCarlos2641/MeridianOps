import { Injectable } from "@angular/core";
import { Product } from "src/app/shared/model/Product";
import { BehaviorSubjectGeneric } from "./behaviorSubjectGeneric";

@Injectable({ providedIn: 'root' })
export class RequisitionService extends BehaviorSubjectGeneric<Product>{
    
    constructor(){
        super();
    }

}