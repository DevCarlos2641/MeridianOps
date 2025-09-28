import { Injectable } from "@angular/core";
import { BehaviorSubjectGeneric } from "./behaviorSubjectGeneric";
import { ProductOutput } from "src/app/shared/model/Product";

@Injectable({ providedIn: 'root' })
export class ProductOutputService extends BehaviorSubjectGeneric<ProductOutput> {

    constructor() {
        super();
    }
}