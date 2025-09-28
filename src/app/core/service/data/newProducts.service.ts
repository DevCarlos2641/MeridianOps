import { Injectable } from "@angular/core";
import { BehaviorSubjectGeneric } from "./behaviorSubjectGeneric";
import { Product } from "src/app/shared/model/Product";

@Injectable({ providedIn: 'root' })
export class NewProductsService extends BehaviorSubjectGeneric<Product>{
    
    constructor(){
        super();
    }

}