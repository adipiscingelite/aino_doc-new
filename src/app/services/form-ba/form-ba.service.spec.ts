import { TestBed } from '@angular/core/testing';

import { FormBaService } from './form-ba.service';

describe('FormBaService', () => {
  let service: FormBaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormBaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
