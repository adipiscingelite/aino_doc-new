import { TestBed } from '@angular/core/testing';

import { PojectService } from './poject.service';

describe('PojectService', () => {
  let service: PojectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PojectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
