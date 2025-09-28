import { EnumStatus } from "../EnumStatusRq";

export class Quote{
    id: number;
    id_user: number;
    id_supplier:number;
    id_local: number;
    date: string;
    days_validity: number;
    status: EnumStatus
}