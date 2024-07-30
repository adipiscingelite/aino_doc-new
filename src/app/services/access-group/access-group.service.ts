import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Role } from '../../control/access-group/access-group.component';

@Injectable({
  providedIn: 'root'
})
export class AccessGroupService {
  private dataListRole = new BehaviorSubject<Role[]>([]);
  dataListRole$ = this.dataListRole.asObservable();

  updateDataListRole(dataList: Role[]) {
    this.dataListRole.next(dataList);
  }
  constructor() { }
}
