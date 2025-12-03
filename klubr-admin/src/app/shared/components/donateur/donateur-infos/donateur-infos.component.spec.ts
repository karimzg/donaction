import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DonateurInfosComponent } from './donateur-infos.component';

describe('DonateurInfosComponent', () => {
  let component: DonateurInfosComponent;
  let fixture: ComponentFixture<DonateurInfosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DonateurInfosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DonateurInfosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
