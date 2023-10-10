import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Illness} from "./illness";

@Injectable({
  providedIn: 'root'
})
export class HealthcareService {

  constructor(private http: HttpClient) { }

  getIllnessList (): Observable<any>{
    return this.http.get('https://corsproxy.io/?https://global.lakmus.org/Dictionaries/icpc2?IsPublic=true');
  }
}
