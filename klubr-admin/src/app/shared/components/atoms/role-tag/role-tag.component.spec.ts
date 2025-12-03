import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleTagComponent } from './role-tag.component';

describe('RoleTagComponent', () => {
  let component: RoleTagComponent;
  let fixture: ComponentFixture<RoleTagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleTagComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RoleTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
