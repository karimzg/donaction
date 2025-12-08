import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionTxtImgComponent } from './section-txt-img.component';

describe('ProjectRealisationComponent', () => {
  let component: SectionTxtImgComponent;
  let fixture: ComponentFixture<SectionTxtImgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionTxtImgComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SectionTxtImgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
