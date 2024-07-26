import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { formsITCM } from '../../form/form-itcm/form-itcm.component';

@Injectable({
  providedIn: 'root'
})
export class FormItcmService {

  private dataListFormITCMSubject = new BehaviorSubject<formsITCM[]>([]);
  dataListFormITCM$ = this.dataListFormITCMSubject.asObservable();

  private  dataListFormAdminSubject = new BehaviorSubject<formsITCM[]>([]);
  dataListFormAdmin$ = this.dataListFormAdminSubject.asObservable();

  private dataListFormUserSubject = new BehaviorSubject<formsITCM[]>([]);
  dataListFormUser$ = this.dataListFormUserSubject.asObservable();

  updateDataListFormITCM(dataList: formsITCM[]) {
    this.dataListFormITCMSubject.next(dataList);
  }
    
  updateDataListFormAdmin(dataList: formsITCM[]) {
    this.dataListFormAdminSubject.next(dataList);
  }
  
  updateDataListFormUser(dataList: formsITCM[]) {
    this.dataListFormUserSubject.next(dataList);
  }
  constructor() { }
}
