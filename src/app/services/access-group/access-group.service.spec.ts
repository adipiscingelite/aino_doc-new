import { TestBed } from '@angular/core/testing';

import { AccessGroupService } from './access-group.service';

describe('AccessGroupService', () => {
  let service: AccessGroupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccessGroupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
