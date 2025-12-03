import {
  AfterViewInit,
  Component,
  ElementRef,
  forwardRef,
  inject,
  input,
  OnDestroy,
  output,
  ViewChild,
  viewChild
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormBuilder,
  FormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  ValidationErrors,
  Validator,
  Validators
} from "@angular/forms";
import { AccordionModule } from "primeng/accordion";
import { InputTextModule } from "primeng/inputtext";
import { SelectButtonModule } from "primeng/selectbutton";
import { CommonModule } from "@angular/common";
import { TransformationService } from "@shared/services/data-transformation.service";
import { EditorComponent } from "../../editor/editor.component";
import { FormControlPipe } from "@shared/pipes/forms/form-control.pipe";
import { FormMediaUpdateComponent } from "../../form-media-update/form-media-update.component";
import { MediaPipe } from "@shared/pipes/media/media.pipe";
import { ErrorDisplayComponent } from "../../error-display/error-display.component";
import { maxHtmlLengthValidator, minHtmlLengthValidator } from "@shared/utils/validators/html.validators";
import { warn } from "@shared/utils/validators/warning/warning.validator";
import { switchMap, tap } from "rxjs/operators";
import { merge, Observable, of, Subscription } from "rxjs";
import { Button } from "primeng/button";
import { TooltipModule } from "primeng/tooltip";
import { DeviceService } from "@shared/services/device.service";

type ChangeCallbackFn<T> = (value: T) => void;
type TouchCallbackFn = () => void;

@Component({
  selector: 'section-txt-img',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AccordionModule,
    SelectButtonModule,
    InputTextModule,
    EditorComponent,
    FormControlPipe,
    FormMediaUpdateComponent,
    ErrorDisplayComponent,
    Button,
    TooltipModule,
  ],
  templateUrl: './section-txt-img.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SectionTxtImgComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => SectionTxtImgComponent),
      multi: true
    },
  ],
  styles: [`
    app-editor {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
  `
  ]
})
export class SectionTxtImgComponent implements ControlValueAccessor, Validator, OnDestroy, AfterViewInit {
  private fb = inject(FormBuilder);
  private transformationService = inject(TransformationService);
  private mediaPipe = inject(MediaPipe);
  public readonly elmRef = inject(ElementRef);
  public readonly deviceService = inject(DeviceService);

  private subscriptions: Subscription = new Subscription();

  public form: FormGroup = this.fb.group({
    __component: ['composant-atoms.section-texte-image'],
    id: [null],
    titre: ['', Validators.required],
    texte: [null, [minHtmlLengthValidator(50), maxHtmlLengthValidator(750), warn(maxHtmlLengthValidator(600))]],
    image: [null, Validators.required],
    imgToTheLeft: [true, Validators.required],
  });

  public image = viewChild<FormMediaUpdateComponent>('image');

  itemUuid = input.required<string>();
  entityLabel = input.required<string>();
  entityField = input.required<string>();
  isSubmitted = input.required<boolean>();
  sendButton = input<boolean>(false);
  titlePlaceholder = input<string>('Votre titre');
  textareaPlaceholder = input<string>('Votre texte');
  removeItem = output<void>();
  sendAction = output<void>();

  @ViewChild('firstInput') firstInput!: ElementRef;

  ngAfterViewInit(): void {
    if (this.firstInput?.nativeElement && this.deviceService.isDesktop()) {
      this.firstInput.nativeElement.focus();
    }
  }

  onChange: (value: Event) => void = () => {
  };
  onTouched: () => void = () => {
  };

  ngOnDestroy() {
    console.log('DESTROY')
    this.subscriptions.unsubscribe();
  }

  validate(control: AbstractControl): ValidationErrors | null {
    return (this.form.valid)
      ? null
      : {invalidForm: {valid: false, message: 'addressForm fields are invalid'}};
  }

  writeValue(val: any): void {
    if (val) {
      if (val.texte && val.texte.type === undefined) {
        val.texte = this.transformationService.transformDataToEditorFormat(val.texte);
      }
      if (val.image && typeof val.image !== 'string') {
        val.image = this.mediaPipe.transform(val.image, 'project_card') || undefined
      }
      this.form.patchValue(val, {emitEvent: false});
    }
  }

  registerOnChange(fn: ChangeCallbackFn<object>): void {
    this.subscriptions.add(this.form.valueChanges.pipe().subscribe(fn));
  }

  registerOnTouched(fn: TouchCallbackFn): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.form.disable() : this.form.enable();
  }

  uploadFile(dynamicZoneId?: number): Observable<boolean> {
    return (this.form.get('image')?.value && this.form.get('image')?.dirty)
      ? of(true).pipe(
        tap(() => this.image()!.uploadFile(dynamicZoneId ? `${dynamicZoneId}` : this.form.get('id')?.value)),
        switchMap(() => merge(this.image()!.onItemLoaded$, this.image()!.onItemErrorLoaded$)),
      )
      : of(false);
  }
}
