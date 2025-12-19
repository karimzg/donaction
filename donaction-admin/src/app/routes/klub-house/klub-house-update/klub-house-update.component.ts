import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Signal,
  signal,
  untracked,
  viewChild,
  ViewEncapsulation,
  WritableSignal
} from '@angular/core';
import { Button } from "primeng/button";
import { GenericUpdateComponent } from "@shared/components/generics/generic-update/generic-update.component";
import { KlubrHouse } from "@shared/utils/models/klubr";
import { PaginatorModule } from "primeng/paginator";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { ErrorDisplayComponent } from "@shared/components/form/error-display/error-display.component";
import { InputTextModule } from "primeng/inputtext";
import { FormControlPipe } from "@shared/pipes/forms/form-control.pipe";
import {
  FormMediaUpdateComponent,
  MediaType
} from "@shared/components/form/form-media-update/form-media-update.component";
import { MediaPipe } from "@shared/pipes/media/media.pipe";
import { ColorPickerModule } from "primeng/colorpicker";
import { EditorComponent } from "@shared/components/form/editor/editor.component";
import { AvatarModule } from "primeng/avatar";
import { TransformationService } from "@shared/services/data-transformation.service";
import { forkJoin, merge, Observable, of, switchMap } from "rxjs";
import { maxHtmlLengthValidator, minHtmlLengthValidator } from "@shared/utils/validators/html.validators";
import { warn } from "@shared/utils/validators/warning/warning.validator";
import { FormGroupPipe } from "@shared/pipes/forms/form-group.pipe";
import { KlubrService } from "@shared/services/klubr.service";
import { PreviewService } from "@shared/services/preview.service";
import { delay, map, take } from "rxjs/operators";
import { AuthFacade } from "../../auth/data-access/+state/auth.facade";
import { TextareaModule } from "primeng/textarea";
import {
  InvalidControlScrollDirective
} from "@shared/components/form/invalid-control-scroll/invalid-control-scroll.directive";
import { TooltipModule } from "primeng/tooltip";
import { AccordionModule } from "primeng/accordion";
import { SelectButtonModule } from "primeng/selectbutton";
import { NgClass } from "@angular/common";
import { RadioButton } from "primeng/radiobutton";
import { fadeAnimation } from "@shared/utils/animations/animations";

@Component({
  selector: 'app-modify-klub-house',
  imports: [
    Button,
    PaginatorModule,
    ReactiveFormsModule,
    ErrorDisplayComponent,
    InputTextModule,
    FormControlPipe,
    FormMediaUpdateComponent,
    ColorPickerModule,
    EditorComponent,
    AvatarModule,
    FormGroupPipe,
    FormControlPipe,
    TextareaModule,
    InvalidControlScrollDirective,
    TooltipModule,
    AccordionModule,
    SelectButtonModule,
    NgClass,
    RadioButton,
    FormsModule,
  ],
  providers: [
    MediaPipe,
  ],
  templateUrl: './klub-house-update.component.html',
  styleUrl: './klub-house-update.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeAnimation]
})
export class KlubHouseUpdateComponent extends GenericUpdateComponent<KlubrHouse> implements AfterViewInit {
  private mediaPipe = inject(MediaPipe);
  private transformationService = inject(TransformationService);
  private klubrService = inject(KlubrService);
  private authFacade = inject(AuthFacade);
  protected previewService = inject(PreviewService);

  /* SPECIFIC VARS */
  // Section Image/Text
  public isLeft: boolean = false;
  public ingredient!: string;

  // imageTextOptions: any[] = [
  //   { label: 'Texte à gauche', value: true, id: 1 },
  //   { label: 'Texte à droite', value: false, id: 2 },
  // ];
  // Main Accordion
  mainAccordionActiveIndex: number | undefined = undefined;

  mainAccordionActiveIndexChange(index: any) {
    this.mainAccordionActiveIndex = index;
  }

  getMainAccordionTabIcon(index: number): string {
    console.log(this.mainAccordionActiveIndex, index)
    return this.mainAccordionActiveIndex === index ? 'pi pi-angle-up' : 'pi pi-angle-down';
  }

  // Citation Sub Accordion
  citationAccordionActiveIndex: number | undefined = undefined;

  citationAccordionActiveIndexChange(index: any) {
    this.citationAccordionActiveIndex = index;
  }

  getCitationAccordionTabIcon(index: number): string {
    return this.citationAccordionActiveIndex === index ? 'pi pi-angle-up' : 'pi pi-angle-down';
  }

  // Partners Accordion
  partnersAccordionActiveIndex: number | undefined = undefined;

  partnersAccordionActiveIndexChange(index: any) {
    this.partnersAccordionActiveIndex = index;
  }

  // Partners Sub Accordion
  partnersSubAccordionActiveIndex: number | undefined = undefined;

  partnersSubAccordionActiveIndexChange(index: any) {
    this.partnersSubAccordionActiveIndex = index;
  }

  // MESSAGES
  protected override successMsg = 'Le Klub a été mis à jour';
  protected override errorUpdateMsg = 'Le Klub n\'a pas pu être modifié';
  protected override errorCreateMsg = 'Le Klub n\'a pas pu être créé';
  protected override routePrefix = '/';

  // Couverture
  couverture = viewChild.required<FormMediaUpdateComponent>('couverture');
  logo = viewChild.required<FormMediaUpdateComponent>('logo');

  // Misc
  public formDisabled: WritableSignal<boolean> = signal<boolean>(false);
  public fileTypesAllowed: Signal<Array<MediaType>> = computed(() => this.permissionsService.memberIsAtLeastAdminEditorSignal() ? ['img', 'video'] : ['img']);

  // SubForm
  protected override subFormToUpdate?: string = 'klubrHouse';

  constructor() {
    super();
  }

  setValue(event: Event, field = 'primary_color') {
    this.entityForm.get(`klubrHouse.${field}`)?.patchValue((event.target as HTMLInputElement).value);
    this.entityForm.get(`klubrHouse.${field}`)?.markAsDirty();
    this.entityForm.markAsDirty();
    this.entityForm.updateValueAndValidity();
  }

  public override goBack(): void {
    this.router.navigate(['/']);
  }

  public override openPreview() {
    this.previewService.previewClub(this.entitySignal()!.klubr);
  }

  protected override initForm(): void {
    const entity = untracked(this.entitySignal);
    const klubForm = new FormGroup({
      logo: new FormControl({
        value: this.mediaPipe.transform(entity?.klubr.logo, 'logo_2x') || undefined,
        disabled: false
      }),
    });

    const klubrHouseForm = new FormGroup({
      couvertureMedia: new FormControl({
        value: this.mediaPipe.transform(entity?.couvertureMedia, 'couv') || undefined,
        disabled: false
      }),
      // COLORS
      primary_color: new FormControl({value: entity?.primary_color || '#000000', disabled: false},
        Validators.required),
      secondary_color: new FormControl({value: entity?.secondary_color || '#FFFFFF', disabled: false},
        Validators.required),
      header_text_color: new FormControl({value: entity?.header_text_color || '#000000', disabled: false},
        Validators.required),
      footer_text_color: new FormControl({value: entity?.footer_text_color || '#FFFFFF', disabled: false},
        Validators.required),
      // PRESENTATION
      title: new FormControl({value: entity?.title || undefined, disabled: false},
        Validators.required),
      description: new FormControl({
          value: this.transformationService.transformDataToEditorFormat(entity!.description),
          disabled: false
        },
        [minHtmlLengthValidator(50), maxHtmlLengthValidator(1200), warn(maxHtmlLengthValidator(800))]),
      metaDescription: new FormControl({
          value: entity?.metaDescription || undefined,
          disabled: false
        },
        [Validators.required, Validators.minLength(55), Validators.maxLength(300), warn(maxHtmlLengthValidator(200))]),
      // COMPONENTS
      partnerList: new FormControl({value: entity?.partnerList || undefined, disabled: false},
      ),
    });
    if (!entity?.primary_color) {
      klubrHouseForm.get('primary_color')?.markAsDirty();
    }
    if (!entity?.secondary_color) {
      klubrHouseForm.get('secondary_color')?.markAsDirty();
    }
    if (!entity?.header_text_color) {
      klubrHouseForm.get('header_text_color')?.markAsDirty();
    }
    if (!entity?.footer_text_color) {
      klubrHouseForm.get('footer_text_color')?.markAsDirty();
    }

    this.entityForm = new FormGroup({
      klub: klubForm,
      klubrHouse: klubrHouseForm,
    });
    this.entityForm.updateValueAndValidity();
  }

  public override resetForm(): void {
    this.entityForm.patchValue({
      klub: {
        logo: this.entitySignal()?.klubr.logo.url || undefined,
      },
      klubrHouse: {
        couvertureMedia: this.entitySignal()?.couvertureMedia.url || undefined,
        primary_color: this.entitySignal()?.primary_color || undefined,
        secondary_color: this.entitySignal()?.secondary_color || undefined,
        header_text_color: this.entitySignal()?.header_text_color || undefined,
        footer_text_color: this.entitySignal()?.footer_text_color || undefined,
        title: this.entitySignal()?.title || undefined,
        description: this.transformationService.transformDataToEditorFormat(this.entitySignal()?.description || ''),
        partenaires: this.entitySignal()?.partnerList || undefined,
        metaDescription: this.entitySignal()?.metaDescription || (this.entitySignal()?.klubr.denomination + ' | Soutenez nous grâce au mécénat!'),
      }
    });
    this.couverture().reset();
    this.logo().reset()
    this.entityForm.markAsPristine();
  }

  protected override formFields(publish = false): { [key: string]: any } {
    // Format fields
    const {klubrHouse} = this.entityForm.value;
    const {description, couvertureMedia, partenaires, ...klubrHouseValues} = klubrHouse;
    if (this.entityForm.get('klubrHouse.description')?.dirty) {
      klubrHouseValues['description'] = this.transformationService.transformEditorToApiFormat(this.entityForm.get('klubrHouse.description')?.value);
    }

    return klubrHouseValues;
  }

  protected override serviceUpdate(uuid: string, formValues: any): Observable<KlubrHouse> {
    return this.klubrService.updateKlubrHouse(uuid, formValues);
  }

  protected override updateFile(entity: KlubrHouse): Observable<KlubrHouse> {
    let observable$: Array<Observable<boolean>> = [];
    if (this.entityForm.get('klubrHouse.couvertureMedia')?.dirty) {
      this.couverture().uploadFile();
      observable$.push(merge(this.couverture().onItemLoaded$, this.couverture().onItemErrorLoaded$).pipe(take(1)));
    }
    if (this.entityForm.get('klub.logo')?.dirty) {
      this.logo().uploadFile();
      observable$.push(merge(this.logo().onItemLoaded$, this.logo().onItemErrorLoaded$).pipe(
        take(1),
        delay(200),
        switchMap(() => untracked(this.entity)?.klubr.uuid ? this.klubrService.getKlubrByUuid(untracked(this.entity)!.klubr.uuid) : of(null)),
        map((klubr) => {
          // Update klub in store
          if (klubr) {
            this.authFacade.updateKlubInList(klubr.uuid, klubr);
            this.sharedFacade.updateKlubInStore(klubr);
          }
          return true;
        })
      ));
    }
    return observable$.length ? forkJoin(observable$).pipe(
      map(() => entity),
    ) : of(entity);
  }


  /* SPECIFIC METHODS*/
}
