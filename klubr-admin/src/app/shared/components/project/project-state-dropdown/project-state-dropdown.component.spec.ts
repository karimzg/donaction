import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectStateDropdownComponent } from './project-state-dropdown.component';

describe('ProjectStateDropdownComponent', () => {
  let component: ProjectStateDropdownComponent;
  let fixture: ComponentFixture<ProjectStateDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectStateDropdownComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProjectStateDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
