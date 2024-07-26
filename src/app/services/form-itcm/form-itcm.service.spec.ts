import { TestBed } from '@angular/core/testing';

import { FormItcmService } from './form-itcm.service';

describe('FormItcmService', () => {
  let service: FormItcmService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormItcmService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
