import { EnumStatusPds } from "../EnumStatusPds";
import { EnumStatus } from "../EnumStatusRq";
import { VoucherFiscal } from "../Voucher_fiscal";
import { Voucher } from "./Voucher";

export class ResponsePdsVoucher{
    pds: PdsByVoucher[];
    comments: Comment[];
    vhs: any[];
    voucher: Voucher;
    fiscal: VoucherFiscal;
    input:any;
}

class PdsByVoucher{
    id_product: number;
    id_requisition: number;
    id_voucher: number;
    name: string;
    date: string;
    amount: number;
    arrived: number;    
    status_pd: EnumStatusPds;
    description: string;
    supplier_name: string;
}

class Comment{
    comment: string
    date: string;
}