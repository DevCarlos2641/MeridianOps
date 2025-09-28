import { EnumStatus } from "../EnumStatusRq";

export class Buy{
    id: number;
    id_supplier: number;
    id_quote: number;
    date: string;
    status: EnumStatus
}