import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListLoadingNoResultsComponent } from './list-loading-no-results.component';

describe('ListLoadingNoResultComponent', () => {
  let component: ListLoadingNoResultsComponent;
  let fixture: ComponentFixture<ListLoadingNoResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListLoadingNoResultsComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ListLoadingNoResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
