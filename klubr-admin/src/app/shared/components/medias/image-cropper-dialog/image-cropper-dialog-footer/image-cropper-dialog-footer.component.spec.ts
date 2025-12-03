import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageCropperDialogFooterComponent } from './image-cropper-dialog-footer.component';

describe('ImageCropperDialogFooterComponent', () => {
  let component: ImageCropperDialogFooterComponent;
  let fixture: ComponentFixture<ImageCropperDialogFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageCropperDialogFooterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageCropperDialogFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
