import { EnumStatusPds } from "../EnumStatusPds";

export class ResponseGetPdsByReq{
    vehs: any[];
    pds: PdsByReq[];
    pdsV: PdsByVoucher[];
    pdsVehs: any[];
}

export class PdsByReq{
    id_requisition: number;
    id_product: number;
    name: string;
    unit: string;
    description_pd: string;
    amount: number;
    description_rq: string;
    arrived:number = 0;
    id_supplier: number;
    name_supplier: string;
}

export class PdsByVoucher{
    id_voucher: number;
    id_product: number;
    arrived: number;
    status: EnumStatusPds;
}