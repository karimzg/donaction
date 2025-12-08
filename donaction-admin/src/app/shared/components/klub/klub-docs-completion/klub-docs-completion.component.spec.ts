import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KlubDocsCompletionComponent } from './klub-docs-completion.component';

describe('KlubDocsCompletionComponent', () => {
  let component: KlubDocsCompletionComponent;
  let fixture: ComponentFixture<KlubDocsCompletionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KlubDocsCompletionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KlubDocsCompletionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
