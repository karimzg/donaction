import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KlubStatsCardComponent } from './klub-stats-card.component';

describe('KlubStatsCardComponent', () => {
  let component: KlubStatsCardComponent;
  let fixture: ComponentFixture<KlubStatsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KlubStatsCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KlubStatsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
