import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabContentSidebarComponent } from './tab-content-sidebar.component';

describe('TabContentSidebarComponent', () => {
  let component: TabContentSidebarComponent;
  let fixture: ComponentFixture<TabContentSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabContentSidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabContentSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
