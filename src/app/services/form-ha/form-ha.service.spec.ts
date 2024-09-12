import { TestBed } from '@angular/core/testing';

import { FormHaService } from './form-ha.service';

describe('FormHaService', () => {
  let service: FormHaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormHaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
