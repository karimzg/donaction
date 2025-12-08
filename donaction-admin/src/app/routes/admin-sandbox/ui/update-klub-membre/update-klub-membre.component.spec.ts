import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateKlubMembreComponent } from './update-klub-membre.component';

describe('UpdateKlubMembreComponent', () => {
  let component: UpdateKlubMembreComponent;
  let fixture: ComponentFixture<UpdateKlubMembreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateKlubMembreComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpdateKlubMembreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
