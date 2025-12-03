import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionsInfoComponent } from './permissions-info.component';

describe('PermissionsInfoComponent', () => {
  let component: PermissionsInfoComponent;
  let fixture: ComponentFixture<PermissionsInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermissionsInfoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PermissionsInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
