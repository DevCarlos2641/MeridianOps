import { EnumStatus } from "../EnumStatusRq";
import { EnumStatusVO } from "../EnumStatusVo";

export class Voucher{
    id:number
    id_voucher: string;
    id_folio: string;
    id_supplier:  number;
    id_user_buy: number;
    id_requisition: number;
    id_user: number;

    date: string;
    authorize: boolean;
    status: EnumStatusVO;
    comment: string;

    name_supplier:string;
    extra: string;
}