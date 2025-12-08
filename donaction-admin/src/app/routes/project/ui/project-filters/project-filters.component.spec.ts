import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectFiltersComponent } from './project-filters.component';

describe('ProjectFiltersComponent', () => {
  let component: ProjectFiltersComponent;
  let fixture: ComponentFixture<ProjectFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectFiltersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
