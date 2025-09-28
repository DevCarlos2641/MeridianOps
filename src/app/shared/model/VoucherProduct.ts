import { EnumStatusPds } from "./EnumStatusPds";

export class VoucherProduct{
    id: number;
    id_voucher: string;
    id_product: number;
    id_supplier: number;
    amount: number;
    description: string;
    status: EnumStatusPds
}