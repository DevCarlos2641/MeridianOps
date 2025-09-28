import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { CredentialsAssistance } from "src/app/features/dashboard/module-2/asistencia/assistance.component";
import { Assistance } from "src/app/shared/model/Assistance";
import { MetricAssistance } from "src/app/shared/model/dto/MetricAssitance";
import { Employed } from "src/app/shared/model/Employed";
import { Enterprise } from "src/app/shared/model/Enterprise";
import { NewPassword } from "src/app/shared/model/NewPassowrd";
import { Ranch } from "src/app/shared/model/Ranch";
import { User } from "src/app/shared/model/User";
import { environment } from "src/environments";

@Injectable({
    providedIn: 'root'
})
export class UserController{
    private url = environment.apiUrl;
    private http = inject(HttpClient);
    // https://api.meridianops.com/asistencia.php

    assistance(credentials: CredentialsAssistance){
        return this.http.post(`https://api.meridianops.com/asistencia.php`, credentials);
    }

    assitancePhoto(formData: FormData){
        return this.http.post(`${this.url}/assistance/photo`, formData);
    }

    getUsers(){
        return this.http.get<User[]>(`${this.url}/user/all`);
    }

    getEnterprises(){
        return this.http.get<Enterprise[]>(`${this.url}/user/enterprise`);
    }

    getRanchs(id:number){
        return this.http.get<Ranch[]>(`${this.url}/user/ranch/${id}`);
    }

    postUser(user: User){
        return this.http.post(`${this.url}/user`, user);
    }

    updateUser(formData: FormData){
        return this.http.post(`${this.url}/user/update`, formData);
    }

    newPassword(password: NewPassword){
        return this.http.post(`${this.url}/user/password`, password);
    }

    getAssistances(date: any){
        return this.http.post<Assistance[]>(`${this.url}/assistance`, date);
    }

    getAssistancesField(date: any, id_ranch: number){
        return this.http.post<any[]>(`${this.url}/assistance/field/${id_ranch}`, date);
    }

    getAssistancesFieldT(date: any, id_ranch: number){
        return this.http.post<any[]>(`${this.url}/assistance/field/tardeada/${id_ranch}`, date);
    }

    getAllRanchs(){
        return this.http.get<Ranch[]>(`${this.url}/ranch`);
    }

    getEmployeds(){
        return this.http.get<Employed[]>(`${this.url}/employed`);
    }

    getEmployedByEnterprise(){
        return this.http.get<Employed[]>(`${this.url}/employed/by_enterprise`);
    }

    putEmployed(employed: Employed){
        return this.http.put(`${this.url}/employed`, employed);
    }
    
    postEmployed(employed: Employed){
        return this.http.post(`${this.url}/employed/new`, employed);
    }

    assistanceMetric1(metrics: MetricAssistance){
        return this.http.post<any[]>(`${this.url}/assistance/metric`, metrics);
    }

}