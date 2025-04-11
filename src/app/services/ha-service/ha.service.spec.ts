import { TestBed } from '@angular/core/testing';

import { HaService } from './ha.service';

describe('HaService', () => {
  let service: HaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
