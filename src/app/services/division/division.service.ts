import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Division } from '../../control/division/division.component';

@Injectable({
  providedIn: 'root'
})
export class DivisionService {
  
  private dataListDivisionSubject = new BehaviorSubject<Division[]>([]);
  dataListDivision$ = this.dataListDivisionSubject.asObservable();

  updateDataListDivision(dataList: Division[]) {
    this.dataListDivisionSubject.next(dataList);
  }
}
