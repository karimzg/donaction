import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { Button } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { FormMediaUpdateComponent } from "@shared/components/form/form-media-update/form-media-update.component";
import { GenericUpdateComponent } from "@shared/components/generics/generic-update/generic-update.component";
import { DocumentType, Klubr, KlubrDocuments } from "@shared/utils/models/klubr";
import { filter, merge, NEVER, Observable, switchMap } from "rxjs";
import { map, take, tap } from "rxjs/operators";
import { FormControlPipe } from "@shared/pipes/forms/form-control.pipe";
import { KlubrService } from "@shared/services/klubr.service";
import { KlubInfosComponent } from "@shared/components/klub/klub-infos/klub-infos.component";
import { DialogService } from "primeng/dynamicdialog";
import { DialogModule } from "primeng/dialog";
import { DocumentValidationModalComponent } from "../document-validation-modal/document-validation-modal.component";
import { MeterGroupModule } from "primeng/metergroup";
import { CommonModule } from "@angular/common";
import { fadeAnimation } from "@shared/utils/animations/animations";
import { ConfirmDialogWrapperService } from "@shared/components/dialog/confirm-dialog/confirm-dialog-wrapper.service";

@Component({
  selector: 'app-legal-document',
  imports: [
    CommonModule,
    Button,
    DialogModule,
    InputTextModule,
    ReactiveFormsModule,
    FormMediaUpdateComponent,
    FormControlPipe,
    KlubInfosComponent,
    MeterGroupModule,
  ],
  providers: [
    DialogService,
  ],
  templateUrl: './legal-document.component.html',
  styleUrl: './legal-document.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeAnimation]
})
export class LegalDocumentComponent extends GenericUpdateComponent<KlubrDocuments> {
  /* SPECIFIC SERVICES */
  private klubrService = inject(KlubrService);
  public confirmDialogWrapperService = inject(ConfirmDialogWrapperService);
  public dialogService = inject(DialogService);
  public cdr = inject(ChangeDetectorRef);

  /* SPECIFIC VARS */
  // MESSAGES
  protected override successMsg = 'Les documents ont été mises à jour';
  protected override errorUpdateMsg = 'Les documents n\'ont pas pu être modifiés';
  protected override errorCreateMsg = 'Les documents n\'ont pas pu être créés';
  protected override routePrefix = '/klub/documents';

  //DOCS
  private justifDomicileDirigeant = viewChild<FormMediaUpdateComponent>('justifDomicileDirigeant');
  private justifDesignationPresident = viewChild<FormMediaUpdateComponent>('justifDesignationPresident');
  private statutsAssociation = viewChild<FormMediaUpdateComponent>('statutsAssociation');
  private ribAssociation = viewChild<FormMediaUpdateComponent>('ribAssociation');
  private avisSituationSIRENE = viewChild<FormMediaUpdateComponent>('avisSituationSIRENE');
  private attestationAffiliationFederation = viewChild<FormMediaUpdateComponent>('attestationAffiliationFederation');
  public meter = computed(() => {
    if (this.klubr()) {
      const validated = this.klubr()!.klubr_info?.requiredDocsValidatedCompletion;
      const pending = this.klubr()!.klubr_info?.requiredDocsWaitingValidationCompletion;
      const refused = this.klubr()!.klubr_info?.requiredDocsRefusedCompletion;
      return [
        {label: 'Validé(s)', color: '#34d399', value: validated, icon: 'pi pi-check-circle'},
        {label: 'En attente de validation', color: '#fbbf24', value: pending, icon: 'pi pi-history'},
        {label: 'Refusé', color: '#ff0000', value: refused, icon: 'pi pi-times-circle'},
      ];
    } else {
      return undefined;
    }
  });
  public klubr = computed(() => this.klubrSignal() || this.entity()?.klubr);
  private klubrSignal = signal<Klubr | undefined>(undefined);
  public klubrUuid = computed(() => this.entitySignal()!.klubr?.uuid);

  constructor() {
    super();
  }

  protected override initForm(): void {
    const entity = untracked(this.entitySignal);
    this.entityForm = new FormGroup({
      justifDomicileDirigeant: new FormControl({value: entity?.justifDomicileDirigeant || undefined, disabled: false},),
      justifDesignationPresident: new FormControl({
        value: entity?.justifDesignationPresident || undefined,
        disabled: false
      },),
      statutsAssociation: new FormControl({value: entity?.statutsAssociation || undefined, disabled: false},),
      ribAssociation: new FormControl({value: entity?.ribAssociation, disabled: false},),
      attestationAffiliationFederation: new FormControl({
        value: entity?.attestationAffiliationFederation,
        disabled: false
      },),
      avisSituationSIRENE: new FormControl({value: entity?.avisSituationSIRENE, disabled: false},),
      statutsAssociationValide: new FormControl({value: entity?.statutsAssociationValide, disabled: false},),
      justifDomicileDirigeantValide: new FormControl({value: entity?.justifDomicileDirigeantValide, disabled: false},),
      justifDesignationPresidentValide: new FormControl({
        value: entity?.justifDesignationPresidentValide,
        disabled: false
      },),
      ribAssociationValide: new FormControl({value: entity?.ribAssociationValide, disabled: false},),
      avisSituationSIRENEValide: new FormControl({value: entity?.avisSituationSIRENEValide, disabled: false},),
      attestationAffiliationFederationValide: new FormControl({
        value: entity?.attestationAffiliationFederationValide,
        disabled: false
      },),
    });
    this.entityForm.updateValueAndValidity();
  }

  public override resetForm(): void {
    const entity = untracked(this.entitySignal);
    this.entityForm.patchValue({
      justifDomicileDirigeant: entity?.justifDomicileDirigeant || '',
      justifDesignationPresident: entity?.justifDesignationPresident || '',
      statutsAssociation: entity?.statutsAssociation || '',
      ribAssociation: entity?.ribAssociation || '',
    });
    this.entityForm.markAsPristine();
  }

  protected override getEntityForCreateMode(klubrDocuments: KlubrDocuments | null): KlubrDocuments | null {
    klubrDocuments = {
      uuid: '',
      justifDomicileDirigeant: undefined,
      justifDesignationPresident: undefined,
      statutsAssociation: undefined,
      ribAssociation: undefined,
      attestationAffiliationFederation: undefined,
      avisSituationSIRENE: undefined,
      klubr: untracked(this.sharedFacade.profile)!.klubr,
      statutsAssociationValide: undefined,
      justifDomicileDirigeantValide: undefined,
      justifDesignationPresidentValide: undefined,
      ribAssociationValide: undefined,
      avisSituationSIRENEValide: undefined,
      attestationAffiliationFederationValide: undefined,
    }
    return klubrDocuments;
  }

  protected override formFields(publish = false): { [key: string]: any } {
    return {
      ...this.entityForm.value,
    };
  }

  protected override updateFile(document: KlubrDocuments): Observable<KlubrDocuments> {
    const updatedDocuments: Observable<boolean>[] = [];
    if (this.isFileFieldDirty('justifDomicileDirigeant')) {
      this.justifDomicileDirigeant()!.uploadFile();
      updatedDocuments.push(
        merge(this.justifDomicileDirigeant()!.onItemLoaded$, this.justifDomicileDirigeant()!.onItemErrorLoaded$).pipe(
          take(1),
        )
      );
    }
    if (this.isFileFieldDirty('justifDesignationPresident')) {
      this.justifDesignationPresident()!.uploadFile();
      updatedDocuments.push(
        merge(this.justifDesignationPresident()!.onItemLoaded$, this.justifDesignationPresident()!.onItemErrorLoaded$).pipe(
          take(1),
        )
      );
    }
    if (this.isFileFieldDirty('statutsAssociation')) {
      this.statutsAssociation()!.uploadFile();
      updatedDocuments.push(
        merge(this.statutsAssociation()!.onItemLoaded$, this.statutsAssociation()!.onItemErrorLoaded$).pipe(
          take(1),
        )
      );
    }
    if (this.isFileFieldDirty('ribAssociation')) {
      this.ribAssociation()!.uploadFile();
      updatedDocuments.push(
        merge(this.ribAssociation()!.onItemLoaded$, this.ribAssociation()!.onItemErrorLoaded$).pipe(
          take(1),
        )
      );
    }
    if (this.isFileFieldDirty('attestationAffiliationFederation')) {
      this.attestationAffiliationFederation()!.uploadFile();
      updatedDocuments.push(
        merge(this.attestationAffiliationFederation()!.onItemLoaded$, this.attestationAffiliationFederation()!.onItemErrorLoaded$).pipe(
          take(1),
        )
      );
    }
    if (this.isFileFieldDirty('avisSituationSIRENE')) {
      this.avisSituationSIRENE()!.uploadFile();
      updatedDocuments.push(
        merge(this.avisSituationSIRENE()!.onItemLoaded$, this.avisSituationSIRENE()!.onItemErrorLoaded$).pipe(
          take(1),
        )
      );
    }

    if (updatedDocuments.length > 0) {
      return merge(...updatedDocuments).pipe(
        take(1),
        switchMap(() => {
          return this.klubrService.getKlubrByUuid(this.klubrUuid(), ['klubr_document', 'klubr_info']).pipe(
            tap((klubr) => {
              this.sharedFacade.updateKlubInStore(klubr);
              this.klubrSignal.set(klubr);
            })
          );
        }),
        map(() => document)
      );
    }
    return NEVER;
  }

  /* SPECIFIC METHODS */
  protected isFileFieldDirty(formControlName: string): boolean {
    return this.entityForm.controls[formControlName].dirty;
  }

  public downloadFile(docType: DocumentType, docName: string, controleName: string): void {
    const mimeType = this.entityForm.get(controleName)?.value.mime;
    this.klubrService.downloadDocument(this.klubrUuid(), docType, docName, 'download', mimeType);
  }

  public onValidatedClick(doc: DocumentType): void {
    const currentStatus = this.entityForm.get(doc + 'Valide')?.value;
    const docName = this.entityForm.get(doc)?.value?.name;
    this.loading.set(true);

    if (currentStatus === null || currentStatus === undefined) {
      const ref = this.dialogService.open(DocumentValidationModalComponent, {
        header: `Modifier le statut de validation du document`,
        width: '40rem',
        modal: true,
        contentStyle: {overflow: 'auto'},
        styleClass: 'overflow-visible',
        breakpoints: {
          '1199px': '40vw',
          '460px': '90vw'
        },
        data: {
          message: `Veuillez choisir une nouvelle date limite de financement pour votre projet.`
        }
      });
      ref?.onClose.pipe(
        take(1),
        filter((response) => response !== undefined),
      ).subscribe({
        next: (response: boolean) => {
          this.updateDocumentStatus(doc, response, docName);
        },
        complete: () => {
          this.loading.set(false);
        }
      });
    } else {
      this.confirmDialogWrapperService.confirm({
        message: `Passer le document en ${currentStatus ? 'non validé' : 'validé'} ?`,
        header: `Modifier le statut de validation du document`,
        accept: () => {
          this.updateDocumentStatus(doc, !currentStatus, docName);
        },
        reject: () => {
        }
      });
    }
  }

  private updateDocumentStatus(doc: DocumentType, status: boolean, docName: string): void {
    this.klubrService.updateKlubrDocumentsValidation(this.klubrUuid(), doc, status).pipe(take(1)).subscribe({
      next: (klubr) => {
        this.sharedFacade.updateKlubInStore(klubr);
        this.klubrSignal.set(klubr);
        this.loading.set(false);
        this.entityForm.get(doc + 'Valide')?.setValue(klubr.klubr_document![doc + 'Valide']);
        this.cdr.detectChanges();
        this.toastService.showSuccessToast('Statut de document', `Le document ${docName} a été ${klubr.klubr_document![doc + 'Valide'] ? 'validé' : 'invalidé'}`);
      },
      error: (error) => {
        this.loading.set(false);
        this.toastService.showErrorToast('Erreur', error.message);
      },
    });
  }

  protected readonly untracked = untracked;
}
