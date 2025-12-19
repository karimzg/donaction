import {
  AfterViewInit,
  Component,
  computed,
  effect,
  inject,
  model,
  Signal,
  signal,
  untracked,
  viewChild,
  viewChildren,
  ViewEncapsulation,
  WritableSignal,
} from '@angular/core';
import { KlubProject, ProjectStatus, TmplProjectLibrary } from "@shared/utils/models/klubr";
import { delay, map, shareReplay, switchMap, take, takeLast, tap } from "rxjs/operators";
import { CommonModule, DatePipe } from "@angular/common";
import { KlubrMembre } from "@shared/utils/models/user-details";
import { concat, merge, Observable, of } from "rxjs";
import { Button } from "primeng/button";
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ErrorDisplayComponent } from "@shared/components/form/error-display/error-display.component";
import { InputTextModule } from "primeng/inputtext";
import { ToastModule } from "primeng/toast";
import { FileUploadModule } from "primeng/fileupload";
import { BadgeModule } from "primeng/badge";
import { MenuItem } from "primeng/api";
import { EditorComponent } from "@shared/components/form/editor/editor.component";
import { AvatarModule } from "primeng/avatar";
import { TransformationService } from "@shared/services/data-transformation.service";
import { defaultProfilePopulate, ProfileService } from "@shared/services/profile.service";
import { ProjectService } from "@shared/services/project.service";
import { MediaPipe } from "@shared/pipes/media/media.pipe";
import { dateAtLeastTomorrowValidator } from "@shared/utils/validators/date.validator";
import { maxHtmlLengthValidator, minHtmlLengthValidator } from "@shared/utils/validators/html.validators";
import { FormMediaUpdateComponent } from "@shared/components/form/form-media-update/form-media-update.component";
import { DatePickerComponent } from "@shared/components/form/date-picker/date-picker.component";
import { FormControlPipe } from "@shared/pipes/forms/form-control.pipe";
import { PreviewService } from "@shared/services/preview.service";
import {
  ProjectStateDropdownComponent
} from "@shared/components/project/project-state-dropdown/project-state-dropdown.component";
import { ProjectStatusPipe } from "@shared/components/project/project-state-dropdown/pipes/project-status.pipe";
import { getLabelFromApiKey } from "@shared/components/project/project-state-dropdown/model/status-rules";
import { FocusTrapModule } from "primeng/focustrap";
import { TextareaModule } from "primeng/textarea";
import { CachingService } from "@shared/services/caching.service";
import { TmplCategoryPipe } from "../../pipes/tmpl-category.pipe";
import { ImageModule } from "primeng/image";
import { urlToFormFile } from "@shared/utils/helpers/form-helpers";
import { GenericUpdateComponent } from "@shared/components/generics/generic-update/generic-update.component";
import { warn } from "@shared/utils/validators/warning/warning.validator";
import { environment } from "@environments/environment";
import { TooltipModule } from "primeng/tooltip";
import {
  InvalidControlScrollDirective
} from "@shared/components/form/invalid-control-scroll/invalid-control-scroll.directive";
import { AccordionModule } from "primeng/accordion";
import { FormArrayPipe } from "@shared/pipes/forms/form-array.pipe";
import {
  SectionTxtImgComponent
} from "@shared/components/form/sections-strapi/section-txt-img/section-txt-img.component";
import { Message } from 'primeng/message';
import { SpeedDial, SpeedDialModule } from "primeng/speeddial";
import { Select } from "primeng/select";
import { ProfileFilters } from "@app/routes/members/model/profile-filters";
import { ApiListResult, Severity2 } from "@shared/utils/models/misc";
import { fadeAnimation } from "@shared/utils/animations/animations";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: 'app-project-update',
  imports: [
    CommonModule,
    Button,
    FormsModule,
    ReactiveFormsModule,
    ErrorDisplayComponent,
    InputTextModule,
    ToastModule,
    FileUploadModule,
    BadgeModule,
    EditorComponent,
    FormControlPipe,
    DatePickerComponent,
    AvatarModule,
    MediaPipe,
    FormMediaUpdateComponent,
    ProjectStateDropdownComponent,
    ProjectStatusPipe,
    FocusTrapModule,
    TextareaModule,
    TmplCategoryPipe,
    ImageModule,
    TooltipModule,
    InvalidControlScrollDirective,
    AccordionModule,
    SectionTxtImgComponent,
    FormArrayPipe,
    SpeedDialModule,
    Message,
    Select,
    SpeedDial,
  ],
  providers: [
    MediaPipe,
  ],
  templateUrl: './project-update.component.html',
  styleUrl: './project-update.component.scss',
  encapsulation: ViewEncapsulation.None,
  animations: [fadeAnimation]
})
export class ProjectUpdateComponent extends GenericUpdateComponent<KlubProject> implements AfterViewInit {
  /* SPECIFIC SERVICES */
  private projectService = inject(ProjectService);
  private transformationService = inject(TransformationService);
  private profileService = inject(ProfileService);
  private cachingService = inject(CachingService);
  protected previewService = inject(PreviewService);
  private mediaPipe = inject(MediaPipe);
  private fb = inject(FormBuilder);
  private datePipe = new DatePipe('en-US');
  private activatedRoute = inject(ActivatedRoute);

  /* SPECIFIC VARS */
  // MESSAGES
  protected override successMsg = 'Le projet a été mis à jour';
  protected override errorUpdateMsg = 'Le projet n\'a pas pu être modifié';
  protected override errorCreateMsg = 'Le projet n\'a pas pu être créé';
  protected override routePrefix = '/project';

  // Couverture
  public couvUrlSignal: WritableSignal<string | undefined> = signal<string | undefined>(undefined);
  private couverture = viewChild<FormMediaUpdateComponent>('couverture');

  // Dropdown options
  public creatorOptions: WritableSignal<Array<Partial<KlubrMembre>> | undefined> = signal<Array<Partial<KlubrMembre>> | undefined>(undefined);

  // Templates (inputs from route data)
  public isTemplate = model<boolean>(false, {alias: 'isTemplate'});
  public fromTemplate = model<boolean>(false, {alias: 'fromTemplate'});

  public mergedTmplLibraries$?: Observable<Array<TmplProjectLibrary>>;
  public selectedTmplLibrary: WritableSignal<string | undefined> = signal<string | undefined>(undefined);

  // Misc
  public formDisabled: WritableSignal<boolean> = signal<boolean>(false);
  public disabledMsg: WritableSignal<Array<{ severity: Severity2, text: string }> | undefined> = signal<Array<{
    severity: Severity2,
    text: string
  }> | undefined>(undefined);
  public pathsToUnvalidate: WritableSignal<Array<string>> = signal<Array<string>>([]);

  // Facturation
  public isBilled: Signal<boolean> = computed(() => !!this.entitySignal()?.invoice_line);
  public tradePolicyPourcentage: Signal<number> = computed(() => this.sharedFacade.profile()?.klubr?.trade_policy?.commissionPercentage || 0);

  // Réalisations
  public realisations = viewChildren<SectionTxtImgComponent>('realisation');
  public contenus = viewChildren<SectionTxtImgComponent>('contenu');

  speedDialItems: MenuItem[] = [
    {
      tooltipOptions: {
        tooltipLabel: 'Ajouter une réalisation'
      },
      icon: 'pi pi-verified',
      command: () => {
        this.addRealisation();
      }
    },
    {
      tooltipOptions: {
        tooltipLabel: 'Ajouter une section texte/image'
      },
      icon: 'pi pi-images',
      command: () => {
        this.addContenu();
      }
    },
  ];

  constructor() {
    super();

    // Disable form if project is not in draft or waitingApproval mode, for Members
    // Set paths to unvalidate, creator options and formMedia
    effect(() => {
      if (this.entitySignal()) {
        if (this.editMode) {
          if ((this.permissionsService.memberIsMemberSignal() && (this.entitySignal()?.status !== 'draft' && this.entitySignal()?.status !== 'waitingApproval'))
            || (this.entitySignal()?.status === 'deleted') || this.isBilled()) {
            this.entityForm.disable();
            this.formDisabled.set(true);
            let text: string;
            if (untracked(this.isBilled)) {
              text = `Le projet a été facturé et ne peut plus être modifié. Vous pouvez toutefois ajouter des réalisations.`;
            } else {
              const projectStatusLabel = getLabelFromApiKey(this.entitySignal()!.status);
              text = `Le status "${projectStatusLabel}" du projet ne permet pas de le modifier. ${this.entitySignal()?.status !== 'deleted' ? 'Demandez à un dirigeant du Klub de le faire.' : ''}`;
            }
            this.disabledMsg.set(
              [{
                severity: 'warn',
                text
              }]
            );
          }
        }
        this.pathsToUnvalidate.set(this.pathsToUnvalidateDataRequest(this.entitySignal()!));
        this.setCreatorOptions();
        this.setFormMediaUpdate();
      }
    });

    // Merge Template libraries
    effect(() => {
      if (this.isTemplate() && this.sharedFacade.profile()!.klubr) {
        const libraries = this.sharedFacade.profile()!.klubr!.template_projects_libraries;
        this.mergedTmplLibraries$ = this.cachingService.cacheObservable<ApiListResult<TmplProjectLibrary>>(`tmplLibrary-${this.sharedFacade.profile()?.klubr?.slug}`,
          this.projectService.getOwnProjectTmplLibraries(libraries.map((klubr) => klubr.uuid)).pipe(
            shareReplay(1),
          )).pipe(
          map((res) => res.data as Array<TmplProjectLibrary>),
          tap((libraries) => this.selectedTmplLibrary.set(libraries[0]?.uuid)),
        );
      }
    });
  }

  override ngAfterViewInit(): void {
    super.ngAfterViewInit();
    if (this.activatedRoute.snapshot.fragment === 'addRealisation') {
      this.addRealisation();
      // Remove URL fragment
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }

  public override goBack(): void {
    this.router.navigate(['/project', 'listing']);
  }

  /* OVERRIDE METHODS */
  protected override initForm(): void {
    const entity = untracked(this.entitySignal);
    this.entityForm = new FormGroup({
      titre: new FormControl({value: entity?.titre || undefined, disabled: false},
        Validators.required),
      metaDescription: new FormControl({
          value: entity?.metaDescription || undefined,
          disabled: false
        },
        this.editMode ? [Validators.required, Validators.minLength(55), Validators.maxLength(300), warn(maxHtmlLengthValidator(200))] : []),
      couverture: new FormControl({
          value: this.mediaPipe.transform(entity?.couverture, 'couv_project') || undefined,
          disabled: false
        },
        Validators.required),
      presentationDescription: new FormControl({
          value: this.transformationService.transformDataToEditorFormat(entity!.presentationDescription),
          disabled: false
        },
        [minHtmlLengthValidator(50), maxHtmlLengthValidator(2000), warn(maxHtmlLengthValidator(1000))]),
      descriptionCourte: new FormControl({
          value: this.transformationService.transformDataToEditorFormat(entity!.descriptionCourte),
          disabled: false
        },
        [minHtmlLengthValidator(50), maxHtmlLengthValidator(500), warn(maxHtmlLengthValidator(300))]),
      klubr_membre: new FormControl({
          value: entity?.klubr_membre?.uuid || undefined,
          disabled: false
        },
        Validators.required),
      montantAFinancer: new FormControl<number>({
          value: entity?.montantAFinancer || 1000,
          disabled: false
        },
        [Validators.required, Validators.min(1), Validators.max(100000)]),
      dateLimiteFinancementProjet: new FormControl<Date | string | undefined>({
          value: entity?.dateLimiteFinancementProjet,
          disabled: false
        },
        [dateAtLeastTomorrowValidator(), Validators.required]),
      klubr: new FormControl({value: entity?.klubr?.uuid || undefined, disabled: false},
        Validators.required),
      isTemplate: new FormControl({value: entity?.isTemplate || false, disabled: false},
        Validators.required),
      status: new FormControl({value: entity?.status || 'draft', disabled: false},
        Validators.required),
      template_projects_category: new FormControl({
          value: entity?.template_projects_category?.uuid || undefined,
          disabled: false
        },
        untracked(this.isTemplate) ? [Validators.required] : []),
      isFromTemplate: new FormControl({
        value: entity?.isFromTemplate || false,
        disabled: false
      }, []),
      tmplReference: new FormControl({
        value: entity?.tmplReference?.uuid || undefined,
        disabled: false
      }, []),
      realisations: new FormArray(
        entity?.realisations?.map((section) => new FormControl(section)) || []
      ),
      contenu: new FormArray(
        entity?.contenu?.map((section) => new FormControl(section)) || []
      ),
    });
    this.entityForm.updateValueAndValidity();
    if (untracked(this.fromTemplate)) {
      this.entityForm.markAsDirty();
    }
  }

  public override resetForm(): void {
    const entity = untracked(this.entitySignal);
    (this.entityForm.get('realisations') as FormArray).clear();
    this.entityForm.patchValue({
      titre: entity?.titre || '',
      metaDescription: entity?.metaDescription || '',
      couverture: entity?.couverture?.url || undefined,
      presentationDescription: this.transformationService.transformDataToEditorFormat(entity?.presentationDescription || ''),
      descriptionCourte: this.transformationService.transformDataToEditorFormat(entity?.descriptionCourte || ''),
      klubr_membre: entity?.klubr_membre?.uuid || undefined,
      montantAFinancer: entity?.montantAFinancer || 0,
      dateLimiteFinancementProjet: (new Date(entity?.dateLimiteFinancementProjet || new Date())),
      template_projects_category: entity?.template_projects_category?.uuid || undefined,

    });
    // Reset Réalisations
    (this.entityForm.get('realisations') as FormArray).clear();
    entity?.realisations?.map((section) => {
      (this.entityForm.get('realisations') as FormArray).push(new FormControl(section));
    });
    // Reset Contenu
    (this.entityForm.get('contenu') as FormArray).clear();
    entity?.contenu?.map((section) => {
      (this.entityForm.get('contenu') as FormArray).push(new FormControl(section));
    });

    this.couverture()!.reset();
    this.entityForm.markAsPristine();
  }

  protected override setEditMode(entity: KlubProject | null): void {
    this.editMode = !!entity && !untracked(this.fromTemplate);
    this.isTemplate.update((isTemplate) => (!!entity?.isTemplate && !untracked(this.fromTemplate)) || isTemplate);
  }

  protected override getEntityForCreateMode(project: KlubProject | null): KlubProject | null {
    if (this.fromTemplate() && project) {
      const dateLimiteFinancementProjet = new Date();
      dateLimiteFinancementProjet.setMonth(dateLimiteFinancementProjet.getMonth() + 1);
      // Get project.couverture from template, to set it in formMediaUpdate onAfterViewInit
      if (project.couverture) {
        this.couvUrlSignal.set(project.couverture!.url);
      }
      project = {
        ...project,
        ...{
          uuid: '',
          slug: '',
          montantTotalDonations: 0,
          nbDons: 0,
          klubr: this.sharedFacade.profile()!.klubr,
          isTemplate: false,
          klubr_membre: this.sharedFacade.profile()!,
          dateLimiteFinancementProjet,
          status: 'draft',
          template_projects_category: undefined,
          couverture: undefined,
          isFromTemplate: true,
          tmplReference: project,
        }
      };
    } else {
      const dateLimiteFinancementProjet = new Date();
      dateLimiteFinancementProjet.setMonth(dateLimiteFinancementProjet.getMonth() + 1);
      // >>> Init entitySignal MODE CREATE
      project = {
        uuid: '',
        slug: '',
        montantTotalDonations: 0,
        nbDons: 0,
        klubr: this.sharedFacade.profile()!.klubr,
        isTemplate: this.isTemplate(),
        titre: '',
        couverture: undefined,
        presentationDescription: this.transformationService.transformEditorToApiFormat(''),
        descriptionCourte: this.transformationService.transformEditorToApiFormat(''),
        klubr_membre: this.sharedFacade.profile()!,
        montantAFinancer: 1000,
        dateLimiteFinancementProjet,
        status: 'draft',
        template_projects_category: undefined,
      };
    }
    return project;
  }

  protected override formFields(publish = false): { [key: string]: any } {
    // Format fields
    let {couverture, descriptionCourte, presentationDescription, ...formValues} = this.entityForm.value;
    if (this.entityForm.get('presentationDescription')?.dirty) {
      formValues['presentationDescription'] = this.transformationService.transformEditorToApiFormat(this.entityForm.get('presentationDescription')?.value);
    } else if (this.fromTemplate()) {
      formValues['presentationDescription'] = this.entitySignal()!.presentationDescription;
    }
    if (this.entityForm.get('descriptionCourte')?.dirty) {
      formValues['descriptionCourte'] = this.transformationService.transformEditorToApiFormat(this.entityForm.get('descriptionCourte')?.value);
    } else if (this.fromTemplate()) {
      formValues['descriptionCourte'] = this.entitySignal()!.descriptionCourte;
    }
    formValues['dateLimiteFinancementProjet'] = new Date(this.datePipe.transform(formValues['dateLimiteFinancementProjet'], 'yyyy-MM-dd')!);
    if (publish) {
      formValues['status'] = 'published';
    }
    if (this.isTemplate()) {
      formValues['isTemplate'] = true;
    }

    // Réalisations
    this.entityForm.get('realisations')?.value.forEach((section: any, i: number) => {
      delete formValues['realisations'][i]['image'];
      if (formValues['realisations'][i]['id'] === null) {
        formValues['realisations'][i]['id'] = undefined;
      }
      if (
        this.realisations()[i].form.get('texte')?.dirty
        && (this.entityForm.get('realisations')! as FormArray).controls[i].value.texte
      ) {
        formValues['realisations'][i]['texte'] = this.transformationService.transformEditorToApiFormat(section.texte);
      } else {
        formValues['realisations'][i]['texte'] = undefined;
      }
    });
    // Contenu
    this.entityForm.get('contenu')?.value.forEach((section: any, i: number) => {
      delete formValues['contenu'][i]['image'];
      if (formValues['contenu'][i]['id'] === null) {
        formValues['contenu'][i]['id'] = undefined;
      }
      if (
        this.contenus()[i].form.get('texte')?.dirty
        && (this.entityForm.get('contenu')! as FormArray).controls[i].value.texte
      ) {
        formValues['contenu'][i]['texte'] = this.transformationService.transformEditorToApiFormat(section.texte);
      } else {
        formValues['contenu'][i]['texte'] = undefined;
      }
    });
    return formValues;
  }

  protected override pathsToUnvalidateDataRequest(project: KlubProject): string[] {
    return this.projectService.pathsToUnvalidateDataRequest(project);
  }

  protected override cacheToUnvalidate(entity: KlubProject) {
    if (this.isTemplate()) {
      this.cachingService.clearCacheKey(`tmplLibrary-${this.sharedFacade.profile()?.klubr?.slug}`);
    }
    const endpoint = environment.apiUrl + 'klub-projets/' + this.entitySignal()?.uuid + '/poster-pdf?asImage=true';
    this.cachingService.clearCacheKey(endpoint);
  }

  protected override preCreateHook(formValues: { [key: string]: any }): { [key: string]: any } {
    formValues['slug'] = 'null';
    return formValues;
  }

  protected override serviceUpdate(uuid: string, formValues: any): Observable<KlubProject> {
    return this.projectService.updateProject(uuid, formValues);
  }

  protected override serviceCreate(formValues: any): Observable<KlubProject> {
    return this.projectService.createProject(formValues).pipe(
      map((response) => response.data as KlubProject),
    );
  }

  protected override updateFile(project: KlubProject): Observable<KlubProject> {
    let observable$: Array<Observable<boolean>> = [];
    if (this.entityForm.controls['couverture'].dirty) {
      this.couverture()!.uploadFile();
      observable$.push(merge(this.couverture()!.onItemLoaded$, this.couverture()!.onItemErrorLoaded$).pipe(
        take(1),
      ));
    }

    // Réalisations
    project.realisations?.forEach((realisation, index) => {
      const dynamicZoneId = realisation.id ? realisation.id : undefined;
      if (this.realisations()[index].form.get('image')?.dirty) {
        observable$.push(this.realisations()[index].uploadFile(dynamicZoneId).pipe(
          take(1),
        ));
      }
    });

    // Contenus
    project.contenu?.forEach((contenu, index) => {
      const dynamicZoneId = contenu.id ? contenu.id : undefined;
      if (this.contenus()[index].form.get('image')?.dirty) {
        observable$.push(this.contenus()[index].uploadFile(dynamicZoneId).pipe(
          take(1),
        ));
      }
    });

    return observable$.length ? concat(...observable$).pipe(
      takeLast(1),
      tap((a) => console.log('%cFILES UPLOADED concat', 'color: red', a)),
      map(() => project),
    ) : of(project);
  }

  protected override reloadEntity(entity: KlubProject): Observable<KlubProject> {
    return of(true).pipe(
      delay(100),
      switchMap(() => this.projectService.getProject(entity.uuid)),
    );
  }

  protected override updateSubFormsValueAndValidity(): void {
    // Réalisations
    this.realisations()?.map((realisation) => {
      // realisation.form.updateValueAndValidity();
      realisation.form.markAllAsTouched();
    });
    // Contenu
    this.contenus()?.map((contenu) => {
      // contenu.form.updateValueAndValidity();
      contenu.form.markAllAsTouched();
    });
  }

  protected override setCustomAnalyticsProps(): void {
    if (this.entitySignal()?.isTemplate) {
      this.customAnalyticsProps = ' - IsTemplate';
    }
    if (this.entitySignal()?.isFromTemplate) {
      this.customAnalyticsProps = ' - IsFromTemplate';
    }
  }

  public override openPreview() {
    this.previewService.previewProject(this.entitySignal()!, this.entitySignal()!.klubr!);
  }

  protected override markSubFormsAsPristine(): void {
    this.entityForm.get('realisations')?.markAsPristine();
    this.entityForm.get('contenu')?.markAsPristine();
  }

  /* SPECIFIC METHODS */
  private setFormMediaUpdate() {
    if (this.couvUrlSignal()) {
      urlToFormFile(this.couvUrlSignal()!, 'couverture.jpg').then((file) => {
        this.couverture()!.setInitFile(file);
        this.couvUrlSignal.set(undefined);
      });
    }
  }

  public setCreatorOptions() {
    const currentProfile = untracked(this.sharedFacade.profile)!;
    const klubUuid = untracked(this.entitySignal)?.klubr.uuid;
    if (!klubUuid) {
      return;
    }
    const filters: ProfileFilters = {
      klubrUUIDs: [klubUuid!],
      uuid: this.permissionsService.memberIsAtLeastLeader(currentProfile) ? undefined : currentProfile.uuid,
    };
    this.cachingService.cacheObservable(`profiles-${filters.klubrUUIDs?.join(',')}-${filters.uuid}`, this.profileService.getProfilesWithFilters(filters, defaultProfilePopulate)).subscribe({
      next: (response: any) => {
        this.creatorOptions.set(response.data.map((klubrMembre: KlubrMembre) => ({
            prenom: klubrMembre.prenom,
            nom: klubrMembre.nom,
            uuid: klubrMembre.uuid,
            avatar: klubrMembre.avatar
          }
        )));
      }
    });
  }

  public onStatusChange(event: ProjectStatus) {
    this.entitySignal.update((entity) => ({...entity, status: event} as KlubProject));
  }

  public onLimitDateChanged(event: Date) {
    this.entitySignal.set({...this.entitySignal()!, dateLimiteFinancementProjet: event});
  }

  /* REALISATIONS FORMS */
  addRealisation() {
    (this.entityForm.get('realisations') as FormArray).push(this.fb.control({
      // __component: 'klubr-realisation',
      // id: '',
      titre: '',
      texte: '',
      image: undefined,
      imgToTheLeft: false,
    }));
    (this.entityForm.get('realisations') as FormArray).at((this.entityForm.get('realisations') as FormArray).length - 1).markAsPristine();
    setTimeout(() => {
      this.realisations()[this.realisations().length - 1].elmRef.nativeElement.scrollIntoView({behavior: 'smooth'});
    }, 500);
  }

  removeRealisation(index: number) {
    (this.entityForm.get('realisations') as FormArray).removeAt(index);
    this.entityForm.get('realisations')?.markAsDirty();
    this.entityForm.markAllAsTouched();
  }

  /* CONTENU FORMS */
  addContenu() {
    (this.entityForm.get('contenu') as FormArray).push(this.fb.control({
      titre: '',
      texte: '',
      image: undefined,
      imgToTheLeft: false,
    }));
    (this.entityForm.get('contenu') as FormArray).at((this.entityForm.get('contenu') as FormArray).length - 1).markAsPristine();
    setTimeout(() => {
      this.contenus()[this.contenus().length - 1].elmRef.nativeElement.scrollIntoView({behavior: 'smooth'});
    });
  }

  removeContenu(index: number) {
    (this.entityForm.get('contenu') as FormArray).removeAt(index);
    this.entityForm.get('contenu')?.markAsDirty();
    this.entityForm.markAllAsTouched();
  }


}
