import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Users } from '../../control/user-control/user-control.component';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private dataListUsers = new BehaviorSubject<Users[]>([]);
  dataListUser$ = this.dataListUsers.asObservable();

  updateDataListUsers(dataList: Users[]) {
    this.dataListUsers.next(dataList);
  }

  constructor() { }
}