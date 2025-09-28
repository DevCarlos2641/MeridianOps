import { Requisition } from "../Requisition";
import { VoucherProduct } from "../VoucherProduct";
import { Voucher } from "./Voucher";

export interface RequestVoucher{
    voucher: Voucher;
    pds: VoucherProduct[];
    vehs: any[];
    requisition: Requisition;
    guards: any[];
}