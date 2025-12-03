import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericUpdateComponent } from './generic-update.component';

describe('GenericUpdateComponent', () => {
  let component: GenericUpdateComponent;
  let fixture: ComponentFixture<GenericUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenericUpdateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GenericUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
