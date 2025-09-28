import { EnumRole } from "./TableSQL/EnumRole";

export class User{
    id: number;
    id_ranch:number;
    enterprise_name: string;
    ranch_name: string;
    email: string;
    name: string;
    position: string;
    phone: string;
    role: EnumRole;
    profile_url: string
    active: boolean;
}