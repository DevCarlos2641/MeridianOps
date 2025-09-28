import { EnumPriority } from "./EnumPriority";
import { EnumStatus } from "./EnumStatusRq";

export class Requisition{
    id: number;
    id_requisition:string;
    id_user: number;
    id_user_requisition: number;
    id_voucher: string;

    category: string;
    date: string;
    status: EnumStatus;
    priority: EnumPriority;
    comment: string;
}