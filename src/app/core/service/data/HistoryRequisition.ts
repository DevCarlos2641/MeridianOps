import { Injectable } from "@angular/core";
import { ProductRequisition } from "src/app/shared/model/ProductRequisition";
import { BehaviorSubjectGeneric } from "./behaviorSubjectGeneric";
import { Requisition } from "src/app/shared/model/Requisition";

@Injectable({ providedIn: 'root' })
export class HistoryRequisition extends BehaviorSubjectGeneric<Requisition> {

    constructor() {
        super();
    }

}