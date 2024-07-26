import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { formsDA } from '../../form/form-da/form-da.component';

@Injectable({
  providedIn: 'root'
})
export class FormDaService {

  private dataListFormDASubject = new BehaviorSubject<formsDA[]>([]);
  dataListFormDA$ = this.dataListFormDASubject.asObservable();

  private dataListFormAdminSubject = new BehaviorSubject<formsDA[]>([]);
  dataListFormAdmin$ = this.dataListFormAdminSubject.asObservable();

  private dataListFormUserSubject = new BehaviorSubject<formsDA[]>([]);
  dataListFormUser$ = this.dataListFormUserSubject.asObservable();


  updateDataListFormDA(dataList: formsDA[]) {
    this.dataListFormDASubject.next(dataList);
  }

  updateDataListFormAdmin(dataList: formsDA[]) {
    this.dataListFormAdminSubject.next(dataList);
  }

  updateDataListFormUser(dataList: formsDA[]) {
    this.dataListFormUserSubject.next(dataList);
  }
  constructor() { }
}
