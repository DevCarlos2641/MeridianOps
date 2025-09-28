import { EnumPaymentMethod } from "./EnumPaymentMethod";

export class Invoice{
    id: number;
    id_buy: number;
    date: string;
    total: number;
    number_invoice: string;
    payment_method: EnumPaymentMethod
}