import { Employed } from "./Employed";
import { Enterprise } from "./Enterprise";

export class Vehicle {
    id: number;
    id_employed: number;
    id_enterprise: number;
    enterprise_name: string
    economic_number: string;
    date_insurance: string;
    date_lisense: string;
    category: string;
    plate: string;
    type: string;
    brand: string;
    model: string;
    serie_n: string;
    status: string;
    items: string[];
    employed: Employed;
    enterprise: Enterprise;
    poliza: string;
    provider: string
}