import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListPaginationMoreComponent } from './list-pagination-more.component';

describe('ListPaginationMoreComponent', () => {
  let component: ListPaginationMoreComponent;
  let fixture: ComponentFixture<ListPaginationMoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListPaginationMoreComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListPaginationMoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
