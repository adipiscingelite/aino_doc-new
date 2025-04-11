import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { baResolver } from './ba.resolver';

describe('baResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => baResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
