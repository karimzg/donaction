import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateKlubProjectComponent } from './update-klub-project.component';

describe('UpdateKlubProjectComponent', () => {
  let component: UpdateKlubProjectComponent;
  let fixture: ComponentFixture<UpdateKlubProjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateKlubProjectComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpdateKlubProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
