import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KlubStatsComponent } from './klub-stats.component';

describe('KlubStatsComponent', () => {
  let component: KlubStatsComponent;
  let fixture: ComponentFixture<KlubStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KlubStatsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KlubStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
