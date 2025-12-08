import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkMemberComponent } from './link-member.component';

describe('LinkMemberComponent', () => {
  let component: LinkMemberComponent;
  let fixture: ComponentFixture<LinkMemberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinkMemberComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LinkMemberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
