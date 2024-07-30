import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Project } from '../../control/project/project.component';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private dataListProject = new BehaviorSubject<Project[]>([]);
  dataListProject$ = this.dataListProject.asObservable();

  updateDataListProject(dataList: Project[]) {
    this.dataListProject.next(dataList);
  }
  constructor() { }
}
