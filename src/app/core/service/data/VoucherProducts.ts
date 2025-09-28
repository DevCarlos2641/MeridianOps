import { Injectable } from "@angular/core";
import { VoucherProduct } from "src/app/shared/model/VoucherProduct";
import { BehaviorSubjectGeneric } from "./behaviorSubjectGeneric";

@Injectable({ providedIn: 'root' })
export class VoucherProductsService extends BehaviorSubjectGeneric<VoucherProduct> {

    constructor() {
        super();
    }

    override find(id_product: number): VoucherProduct | undefined {
        return this.get().find(item => item.id_product === id_product);
    }

    override update(id: number, partial: Partial<VoucherProduct>): void {
        const current = this.get();
        const updated = current.map(item =>
            item.id_product === id ? { ...item, ...partial } : item
        );
        this.set(updated);
    }

}