import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { haResolver } from './ha.resolver';

describe('haResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => haResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
