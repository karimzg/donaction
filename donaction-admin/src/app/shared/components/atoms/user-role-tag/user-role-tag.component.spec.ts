import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserRoleTagComponent } from './user-role-tag.component';

describe('UserRoleTagComponent', () => {
  let component: UserRoleTagComponent;
  let fixture: ComponentFixture<UserRoleTagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserRoleTagComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserRoleTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
