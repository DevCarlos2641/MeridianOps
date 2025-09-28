import { Injectable } from "@angular/core";
import { BehaviorSubjectGeneric } from "./behaviorSubjectGeneric";
import { ProductRequisition } from "src/app/shared/model/ProductRequisition";

@Injectable({ providedIn: 'root' })
export class RequisitionPd extends BehaviorSubjectGeneric<ProductRequisition> {

    constructor() {
        super();
    }

    override update(id: number, partial: Partial<ProductRequisition>): void {
        const current = this.get();
        const updated = current.map(item =>
            item.id_product === id ? { ...item, ...partial } : item
        );
        this.set(updated);
    }

    override delete(id: number): void {
        const current = this.get();
        const filtered = current.filter(item => item.id_product !== id);
        this.set(filtered);
    }

    override find(id: number): ProductRequisition | undefined {
        return this.get().find(item => item.id_product === id);
    }

}