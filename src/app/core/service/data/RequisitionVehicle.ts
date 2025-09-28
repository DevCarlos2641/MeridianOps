import { Injectable } from "@angular/core";
import { Vehicle } from "src/app/shared/model/Vehicle";
import { BehaviorSubjectGeneric } from "./behaviorSubjectGeneric";

@Injectable({ providedIn: 'root' })
export class Requisitionvehicle extends BehaviorSubjectGeneric<Vehicle> {

    constructor() {
        super();
    }
}