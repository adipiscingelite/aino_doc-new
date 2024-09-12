import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { formsHA } from '../../form/hak-akses/hak-akses.component';

@Injectable({
  providedIn: 'root'
})
export class FormHaService {

  private dataListFormITCMSubject = new BehaviorSubject<formsHA[]>([]);
  dataListFormITCM$ = this.dataListFormITCMSubject.asObservable();

  private  dataListFormAdminSubject = new BehaviorSubject<formsHA[]>([]);
  dataListFormAdmin$ = this.dataListFormAdminSubject.asObservable();

  private dataListFormUserSubject = new BehaviorSubject<formsHA[]>([]);
  dataListFormUser$ = this.dataListFormUserSubject.asObservable();

  updateDataListFormITCM(dataList: formsHA[]) {
    this.dataListFormITCMSubject.next(dataList);
  }
    
  updateDataListFormAdmin(dataList: formsHA[]) {
    this.dataListFormAdminSubject.next(dataList);
  }
  
  updateDataListFormUser(dataList: formsHA[]) {
    this.dataListFormUserSubject.next(dataList);
  }
  constructor() { }
}
