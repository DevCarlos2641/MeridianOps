import { EnumPriority } from "../EnumPriority";
import { EnumStatus } from "../EnumStatusRq";

export class ResponseGetRequisitionFull{
    id: number;
    id_requisition: number;
    id_user: number;
    ids_voucher:string;
    date: string;
    enterprise_name: string;
    ranch_name: string;
    category: string;
    status: EnumStatus;
    priority: EnumPriority;
    comment: string;
}