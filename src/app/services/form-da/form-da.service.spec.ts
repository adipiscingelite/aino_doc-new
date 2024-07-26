import { TestBed } from '@angular/core/testing';

import { FormDaService } from './form-da.service';

describe('FormDaService', () => {
  let service: FormDaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormDaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
