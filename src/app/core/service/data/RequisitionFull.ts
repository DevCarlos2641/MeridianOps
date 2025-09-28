import { Injectable } from "@angular/core";
import { ProductRequisition } from "src/app/shared/model/ProductRequisition";
import { BehaviorSubjectGeneric } from "./behaviorSubjectGeneric";
import { ResponseGetRequisitionFull } from "src/app/shared/model/dto/ResponseGetRequisitionFull";

@Injectable({ providedIn: 'root' })
export class RequisitionFull extends BehaviorSubjectGeneric<ResponseGetRequisitionFull> {

    constructor() {
        super();
    }
}