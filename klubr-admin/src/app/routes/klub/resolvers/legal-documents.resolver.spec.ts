import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { legalDocumentsResolver } from './legal-documents.resolver';

describe('legalDocumentsResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => legalDocumentsResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
