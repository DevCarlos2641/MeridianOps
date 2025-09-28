import { CheckProducts } from "../CheckProducts";
import { Requisition } from "../Requisition";
import { VoucherFiscal } from "../Voucher_fiscal";
import { Voucher } from "./Voucher";

export class RequestStatus{
    requisition: Requisition;
    voucher: Voucher;
    pdsStatus: CheckProducts[]
    fiscal: VoucherFiscal | null
}