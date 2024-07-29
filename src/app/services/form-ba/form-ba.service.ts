import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { formsBA } from '../../form/form-ba/form-ba.component';

@Injectable({
  providedIn: 'root'
})
export class FormBaService {

  private dataListFormBASubject = new BehaviorSubject<formsBA[]>([]);
  dataListFormBA$ = this.dataListFormBASubject.asObservable();

  constructor() { }
}
