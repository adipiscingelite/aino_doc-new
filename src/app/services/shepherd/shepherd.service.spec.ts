import { TestBed } from '@angular/core/testing';

import { ShepherdService } from './shepherd.service';

describe('ShepherdService', () => {
  let service: ShepherdService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShepherdService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
