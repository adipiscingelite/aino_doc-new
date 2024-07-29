import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { documents } from '../../control/document-control/document-control.component';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private dataListDocSubject = new BehaviorSubject<documents[]>([]);
  dataListDoc$ = this.dataListDocSubject.asObservable();

  updateDataListDoc(dataList: documents[]) {
    this.dataListDocSubject.next(dataList);
  }

  constructor() { }
}
