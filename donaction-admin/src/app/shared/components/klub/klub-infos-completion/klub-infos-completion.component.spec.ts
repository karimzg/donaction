import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KlubInfosCompletionComponent } from './klub-infos-completion.component';

describe('KlubInfosCompletionComponent', () => {
  let component: KlubInfosCompletionComponent;
  let fixture: ComponentFixture<KlubInfosCompletionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KlubInfosCompletionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KlubInfosCompletionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
