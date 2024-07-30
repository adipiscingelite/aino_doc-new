import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AppRole } from '../../control/authority/authority.component';

@Injectable({
  providedIn: 'root'
})
export class AppRoleService {
  private dataListAppRole = new BehaviorSubject<AppRole[]>([]);
  dataListAppRole$ = this.dataListAppRole.asObservable();

  updateDataListAppRole(dataList: AppRole[]) {
    this.dataListAppRole.next(dataList);
  }
  constructor() { }
}

