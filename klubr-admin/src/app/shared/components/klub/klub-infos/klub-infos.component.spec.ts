import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KlubInfosComponent } from './klub-infos.component';

describe('KlubInfosComponent', () => {
  let component: KlubInfosComponent;
  let fixture: ComponentFixture<KlubInfosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KlubInfosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KlubInfosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
