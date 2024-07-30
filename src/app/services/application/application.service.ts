import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Application } from '../../control/application/application.component';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private dataListApplication = new BehaviorSubject<Application[]>([]);
  dataListApplication$ = this.dataListApplication.asObservable();

  updateDataListApplication(dataList: Application[]) {
    this.dataListApplication.next(dataList);
  }

  constructor() { }
}
