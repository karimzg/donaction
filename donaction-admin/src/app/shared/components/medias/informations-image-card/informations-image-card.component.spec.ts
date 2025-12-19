import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InformationsImageCardComponent } from './informations-image-card.component';

describe('InformationsImageCardComponent', () => {
  let component: InformationsImageCardComponent;
  let fixture: ComponentFixture<InformationsImageCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InformationsImageCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InformationsImageCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
