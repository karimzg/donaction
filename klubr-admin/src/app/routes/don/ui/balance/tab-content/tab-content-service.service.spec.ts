import { TestBed } from '@angular/core/testing';

import { TabContentServiceService } from './tab-content-service.service';

describe('TabContentServiceService', () => {
  let service: TabContentServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TabContentServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
